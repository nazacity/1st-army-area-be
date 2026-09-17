// ใช้: npm run import:personnel -- <path-to-csv>
// logic อยู่ใน src/modules/personnel/personnel-import.helper.ts (แชร์กับ POST /personnel/import)
import * as fs from 'fs'
import { DataSource } from 'typeorm'
import {
  Personnel,
} from '../src/modules/personnel/entities/personnel.entity'
import { PersonnelsGroup } from '../src/modules/personnel-group/entities/personnel-group.entity'
import { Room } from '../src/modules/room/entities/room.entity'
import { RoomImage } from '../src/modules/room/entities/room-image.entity'
import { UserPayment } from '../src/modules/payment/entities/user-payment.entity'
import { RoomPayment } from '../src/modules/payment/entities/room-payment.entity'
import {
  importPersonnel,
  ImportReport,
} from '../src/modules/personnel/personnel-import.helper'

function printReport(report: ImportReport) {
  console.log(
    `สำเร็จ: ${report.success} | ข้าม: ${report.skipped.length} | error: ${report.errors.length} | แจ้งเตือน: ${report.warnings.length}`,
  )
  report.skipped.forEach((s) => console.warn(`SKIP ${s.username}: ${s.reason}`))
  report.warnings.forEach((w) => console.warn(`WARN ${w.username}: ${w.reason}`))
  report.errors.forEach((s) => console.error(`ERROR ${s.username}: ${s.error}`))
}

async function bootstrap() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('ใช้: npm run import:personnel -- <path-to-csv>')
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
  try {
    const content = fs.readFileSync(csvPath, 'utf-8')
    const report = await importPersonnel(dataSource, content)
    printReport(report)
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
