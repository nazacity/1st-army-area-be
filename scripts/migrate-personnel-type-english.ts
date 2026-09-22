// ใช้: npm run migrate:personnel-type
// Migrate ${ENV}_personnel.type จาก enum ไทย → enum อังกฤษ
// ⚠️ หยุดแอปก่อนรัน: pm2 stop army-area-be (กัน synchronize ยิง query ชนตอน migrate)
// รันแล้วค่อย pm2 start — synchronize จะเห็น enum ตรงกับ entity → boot ผ่าน
//
// idempotent + ทนสถานะ DB ที่ sync ล้มกลางทาง:
// TypeORM recreate enum แบบ rename → ตอน cast ข้อมูล fail อาจทิ้งไว้ว่า
//   column ยังผูก enum เก่า (ไทย) แต่ชื่อ canonical ถูก type ใหม่ (อังกฤษ) กินไป
// เพราะงั้นเช็ค enum "ที่ column ผูกจริง" จาก pg_attribute ไม่ใช่ค้นจากชื่อ
// recreate ผ่าน temp type เสมอ แล้ว drop ของเก่า + orphan ทิ้ง ก่อน rename กลับ
import { DataSource } from 'typeorm'

const MIGRATION_MAP: Record<string, string> = {
  'ทบ.': 'ARMY',
  'ทร.': 'NAVY',
  'ทอ.': 'AIR_FORCE',
  'ตร.': 'POLICE',
  'สป.': 'MOD',
  'บก.ทท.': 'JOINT_FORCE',
  'ฉก.ทม.รอ.': 'ROYAL_PAGE_GUARD',
  'มิตรประเทศ': 'FOREIGN',
}

const ENGLISH_VALUES = Object.values(MIGRATION_MAP)

interface BoundEnum {
  name: string
  vals: string[] | null
}

async function bootstrap() {
  const env = process.env.ENV
  if (!env) {
    console.error('ต้องมี ENV ใน .env (เช่น dev|prod)')
    process.exit(1)
  }
  const table = `${env}_personnel`
  const targetEnum = `${env}_personnel_type_enum`
  const tmpEnum = `${targetEnum}_migrate_tmp`

  const dataSource = new DataSource({
    type: (process.env.DB_TYPE || 'postgres') as 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
  })

  await dataSource.initialize()
  const qr = dataSource.createQueryRunner()
  await qr.connect()
  await qr.startTransaction()
  try {
    // enum ที่ column "type" ผูกอยู่จริง
    const boundRows: BoundEnum[] = await qr.query(
      `SELECT t.typname AS name,
              array_agg(e.enumlabel::text ORDER BY e.enumsortorder) AS vals
       FROM pg_class c
       JOIN pg_attribute a
         ON a.attrelid = c.oid AND a.attname = 'type' AND a.attisdropped = false
       JOIN pg_type t ON t.oid = a.atttypid
       LEFT JOIN pg_enum e ON e.enumtypid = t.oid
       WHERE c.relname = $1
       GROUP BY t.typname`,
      [table],
    )
    const bound = boundRows[0]
    const boundVals = bound?.vals ?? []

    // ข้อมูลปัจจุบันในตาราง
    const dataRows: { type: string; cnt: number }[] = await qr.query(
      `SELECT type::text AS type, COUNT(*)::int AS cnt
       FROM ${table} GROUP BY type::text`,
    )
    const known = new Set([...ENGLISH_VALUES, ...Object.keys(MIGRATION_MAP)])
    for (const row of dataRows) {
      if (!known.has(row.type)) {
        console.warn(
          `ค่าไม่รู้จัก "${row.type}" (${row.cnt} แถว) — cast จะได้ NULL และ fail ถ้า column NOT NULL`,
        )
      }
    }
    const dataIsEnglish = dataRows.every((r) =>
      ENGLISH_VALUES.includes(r.type),
    )

    const sameSet =
      boundVals.length === ENGLISH_VALUES.length &&
      ENGLISH_VALUES.every((v) => boundVals.includes(v))
    const boundIsTarget =
      bound?.name === targetEnum &&
      sameSet &&
      (await qr.query(`SELECT 1 FROM pg_type WHERE typname = $1`, [
        targetEnum,
      ])).length === 1

    if (boundIsTarget && dataIsEnglish) {
      console.log(`enum "${targetEnum}" + ข้อมูลเป็นอังกฤษครบแล้ว — ไม่ต้องแก้`)
    } else {
      const caseLines = [
        ...Object.entries(MIGRATION_MAP).map(
          ([thai, english]) => `WHEN '${thai}' THEN '${english}'`,
        ),
        ...ENGLISH_VALUES.map((v) => `WHEN '${v}' THEN '${v}'`),
      ].join(' ')

      await qr.query(
        `CREATE TYPE ${tmpEnum} AS ENUM (${ENGLISH_VALUES.map((v) => `'${v}'`).join(', ')})`,
      )
      await qr.query(
        `ALTER TABLE ${table} ALTER COLUMN type TYPE ${tmpEnum}
         USING (CASE type::text ${caseLines} END)::${tmpEnum}`,
      )
      // เก่า (ที่ column เคยผูก) ตอนนี้ไร้เจ้าของแล้ว → ลบ
      if (bound) await qr.query(`DROP TYPE ${bound.name}`)
      // orphan: type ใหม่ที่ sync เคยสร้างทิ้งไว้ใต้ชื่อ canonical (ตอนนี้ว่าง เพราะ column ไปผูก tmp แล้ว)
      const orphan = await qr.query(`SELECT 1 FROM pg_type WHERE typname = $1`, [
        targetEnum,
      ])
      if (orphan.length > 0 && bound?.name !== targetEnum) {
        await qr.query(`DROP TYPE ${targetEnum}`)
      }
      await qr.query(`ALTER TYPE ${tmpEnum} RENAME TO ${targetEnum}`)
      console.log(`recreate enum "${targetEnum}" → English สำเร็จ`)
    }

    // เก็บกวาดข้อมูลไทยค้าง (กันเคส recreate ข้ามเพราะ enum ตรง แต่ข้อมูลค้างจาก sync รอบก่อน)
    let total = 0
    for (const [thai, english] of Object.entries(MIGRATION_MAP)) {
      const result = await qr.query(
        `UPDATE ${table} SET type = $1 WHERE type::text = $2 AND "isDeleted" = false`,
        [english, thai],
      )
      const affected = Number((result as unknown[])[1] ?? 0)
      if (affected > 0) console.log(`ข้อมูล ${thai} → ${english}: ${affected} แถว`)
      total += affected
    }
    if (total > 0) console.log(`migrate ข้อมูลเพิ่ม ${total} แถว`)

    const leftover: { type: string; cnt: string }[] = await qr.query(
      `SELECT type::text AS type, COUNT(*)::text AS cnt FROM ${table}
       WHERE type::text NOT IN (${ENGLISH_VALUES.map((v) => `'${v}'`).join(',')})
       GROUP BY type::text`,
    )
    for (const row of leftover) {
      console.warn(`ค่าไม่รู้จักค้างอยู่: "${row.type}" (${row.cnt} แถว)`)
    }

    await qr.commitTransaction()
  } catch (e) {
    await qr.rollbackTransaction()
    throw e
  } finally {
    await qr.release()
    await dataSource.destroy()
  }
}

if (require.main === module) {
  bootstrap()
    .then(() => {
      console.log('เสร็จ — pm2 start army-area-be ได้เลย')
      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
