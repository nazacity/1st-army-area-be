// ใช้: npm run upload:profile-images -- <folder> [--force]
// อ่านไฟล์ภาพในโฟลเดอร์ (ชื่อไฟล์ 6 ตัวแรก = หมายเลขประจำตัว)
// คนละ 1 ไฟล์ (ถ้าซ้ำเอาไฟล์ที่ไม่มี (1)/(2) ต่อท้าย) → upload R2 → update profileImage
import * as fs from 'fs'
import * as path from 'path'
import { DataSource } from 'typeorm'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Personnel } from '../src/modules/personnel/entities/personnel.entity'
import { PersonnelsGroup } from '../src/modules/personnel-group/entities/personnel-group.entity'
import { Room } from '../src/modules/room/entities/room.entity'
import { RoomImage } from '../src/modules/room/entities/room-image.entity'
import { UserPayment } from '../src/modules/payment/entities/user-payment.entity'
import { RoomPayment } from '../src/modules/payment/entities/room-payment.entity'

async function bootstrap() {
  const args = process.argv.slice(2)
  const folder = args[0]
  const force = args.includes('--force')
  if (!folder || !fs.existsSync(folder)) {
    console.error('ใช้: npm run upload:profile-images -- <folder> [--force]')
    process.exit(1)
  }

  const dataSource = new DataSource({
    type: (process.env.DB_TYPE || 'postgres') as 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '101135',
    database: process.env.DB_DATABASE || 'armyarea',
    entities: [Personnel, PersonnelsGroup, Room, RoomImage, UserPayment, RoomPayment],
    synchronize: false,
  })
  await dataSource.initialize()

  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: 'auto',
  })
  const bucket = process.env.R2_BUCKET_NAME!
  const domain = process.env.R2_RESOURCE_DOMAIN!

  const repo = dataSource.getRepository(Personnel)
  const all = await repo.find({ where: { isDeleted: false }, select: ['id', 'username', 'profileImage'] })
  const byUsername = new Map(all.map((p) => [p.username, p]))

  // group files by 6-digit prefix
  const groups = new Map<string, string[]>()
  for (const f of fs.readdirSync(folder)) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue
    const m = /^(\d{6})/.exec(f)
    if (!m) continue
    const list = groups.get(m[1]) ?? []
    list.push(f)
    groups.set(m[1], list)
  }

  const pick = (files: string[]): string => {
    if (files.length === 1) return files[0]
    const original = files.find((f) => !/\(\d+\)\./i.test(f)) // ไฟล์ที่ไม่มี (1)/(2)
    return original ?? files[0]
  }

  let uploaded = 0
  let skipped = 0
  let noUser = 0
  const failed: { file: string; error: string }[] = []
  let skippedAlready: string[] = []

  for (const [username, files] of groups) {
    const personnel = byUsername.get(username)
    if (!personnel) {
      noUser++
      continue
    }
    if (!force && personnel.profileImage?.includes('profiles/')) {
      skippedAlready.push(username)
      skipped++
      continue
    }
    const fileName = pick(files)
    const ext = path.extname(fileName).toLowerCase()
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg'
    const key = `images/profiles/${username}${ext}`

    try {
      const body = fs.readFileSync(path.join(folder, fileName))
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          Metadata: { 'file-name': encodeURIComponent(fileName), 'mime-type': mime },
          ACL: 'public-read',
        }),
      )
      const url = `${domain}/${key}`
      await repo.update(personnel.id, { profileImage: url })
      uploaded++
    } catch (e) {
      failed.push({ file: fileName, error: (e as Error).message })
    }
  }

  console.log(
    `สำเร็จ: ${uploaded} | ข้าม (มีรูปแล้ว): ${skipped} | ไม่พบใน DB: ${noUser} | พลาด: ${failed.length}`,
  )
  if (skippedAlready.length) console.log('ข้าม:', skippedAlready.join(', '))
  failed.forEach((f) => console.error(`FAILED ${f.file}: ${f.error}`))
  await dataSource.destroy()
}

if (require.main === module) {
  bootstrap().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
