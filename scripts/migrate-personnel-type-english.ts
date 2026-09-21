// ใช้: npm run migrate:personnel-type
// Migrate ${ENV}_personnel.type จาก enum ไทย → enum อังกฤษ:
//  1. recreate Postgres enum type ${ENV}_personnel_type_enum (Thai → English values)
//  2. cast ข้อมูลเดิมตาม MIGRATION_MAP ('สป.' → MOD, 'บก.ทท.' → JOINT_FORCE, ฯลฯ)
// รันบน server ไหนก็ได้ — idempotent (enum ตรงอยู่แล้ว = ข้าม, ข้อมูล English แล้ว = ไม่แตะ)
// ⚠️ หยุดแอปก่อนรัน (กัน TypeORM synchronize ยิง query ชนตอน migrate)
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

async function bootstrap() {
  const env = process.env.ENV
  if (!env) {
    console.error('ต้องมี ENV ใน .env (เช่น dev|prod)')
    process.exit(1)
  }
  const table = `${env}_personnel`
  const enumName = `${env}_personnel_type_enum`

  const dataSource = new DataSource({
    type: (process.env.DB_TYPE || 'postgres') as 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '101135',
    database: process.env.DB_DATABASE || 'armyarea',
    synchronize: false,
  })

  await dataSource.initialize()
  const qr = dataSource.createQueryRunner()
  await qr.connect()
  await qr.startTransaction()
  try {
    // cast expression: Thai → English + identity สำหรับค่า English ที่ migrate แล้ว
    const caseLines = [
      ...Object.entries(MIGRATION_MAP).map(
        ([thai, english]) => `WHEN '${thai}' THEN '${english}'`,
      ),
      ...ENGLISH_VALUES.map((v) => `WHEN '${v}' THEN '${v}'`),
    ].join(' ')

    const typeRows: { exists: boolean }[] = await dataSource.query(
      `SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = $1) AS exists`,
      [enumName],
    )
    const hasEnum = typeRows[0]?.exists

    if (hasEnum) {
      const valRows: { vals: string[] | null }[] = await dataSource.query(
        `SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder) AS vals
         FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
         WHERE t.typname = $1`,
        [enumName],
      )
      const current = valRows[0]?.vals ?? []
      const sameSet =
        current.length === ENGLISH_VALUES.length &&
        ENGLISH_VALUES.every((v) => current.includes(v))
      if (sameSet) {
        console.log(`enum "${enumName}" เป็นค่าอังกฤษอยู่แล้ว — ข้าม recreate`)
      } else {
        await qr.query(
          `CREATE TYPE ${enumName}_new AS ENUM (${ENGLISH_VALUES.map((v) => `'${v}'`).join(', ')})`,
        )
        await qr.query(
          `ALTER TABLE ${table} ALTER COLUMN type TYPE ${enumName}_new
           USING (CASE type::text ${caseLines} END)::${enumName}_new`,
        )
        await qr.query(`DROP TYPE ${enumName}`)
        await qr.query(`ALTER TYPE ${enumName}_new RENAME TO ${enumName}`)
        console.log(`recreate enum "${enumName}" → English สำเร็จ`)
      }
    } else {
      console.log(`ไม่พบ enum "${enumName}" — ข้าม recreate (synchronize จะสร้างเอง)`)
    }

    // เก็บกวาดข้อมูลที่ยังเป็นไทย (กรณี enum เดิมถูกเปลี่ยนแต่ข้อมูลค้าง)
    let total = 0
    for (const [thai, english] of Object.entries(MIGRATION_MAP)) {
      const result: unknown[] = await qr.query(
        `UPDATE ${table} SET type = $1 WHERE type::text = $2 AND "isDeleted" = false`,
        [english, thai],
      )
      const affected = Number((result as [unknown, number])[1] ?? 0)
      if (affected > 0) console.log(`ข้อมูล ${thai} → ${english}: ${affected} แถว`)
      total += affected
    }
    console.log(`migrate ข้อมูล ${total} แถว`)

    const leftover: { type: string; cnt: string }[] = await dataSource.query(
      `SELECT type::text AS type, COUNT(*)::text AS cnt FROM ${table}
       WHERE "isDeleted" = false AND type::text NOT IN (${ENGLISH_VALUES.map((v) => `'${v}'`).join(',')})
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
  bootstrap().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
