// ใช้: npm run seed:personnel-admin -- <username> <password>
// สร้าง super_admin ตั้งต้นของระบบ personnel (ตาราง ${ENV}_personnel_admin)
import { DataSource } from 'typeorm'
import { Crypto } from '../src/utils/crypto'
import {
  PersonnelAdmin,
  PersonnelAdminRole,
} from '../src/modules/personnel-admin/entities/personnel-admin.entity'

async function bootstrap() {
  const [username, password] = process.argv.slice(2)
  if (!username || !password) {
    console.error('ใช้: npm run seed:personnel-admin -- <username> <password>')
    process.exit(1)
  }

  const dataSource = new DataSource({
    type: (process.env.DB_TYPE || 'postgres') as 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '101135',
    database: process.env.DB_DATABASE || 'armyarea',
    entities: [PersonnelAdmin],
    synchronize: false,
  })

  await dataSource.initialize()
  try {
    const repo = dataSource.getRepository(PersonnelAdmin)

    const existing = await repo.findOne({
      where: { username: username.toLowerCase() },
    })
    if (existing) {
      console.log(`มี username "${username}" อยู่แล้ว — ข้าม`)
      return
    }

    await repo.save(
      repo.create({
        username: username.toLowerCase(),
        password: await Crypto.hash(password),
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '-',
        role: PersonnelAdminRole.SUPER_ADMIN,
        isActive: true,
      }),
    )
    console.log(`สร้าง super_admin "${username}" สำเร็จ`)
  } finally {
    await dataSource.destroy()
  }
}

if (require.main === module) {
  bootstrap().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
