// ใช้: npm run import:personnel-vehicles -- <path-to-xlsx>
// logic อยู่ใน src/modules/personnel-vehicle/personnel-vehicle-import.helper.ts
// (แชร์กับ POST /personnel-vehicle/import)
import * as fs from 'fs'
import { DataSource } from 'typeorm'
import { Personnel } from '../src/modules/personnel/entities/personnel.entity'
import { PersonnelsGroup } from '../src/modules/personnel-group/entities/personnel-group.entity'
import { Room } from '../src/modules/room/entities/room.entity'
import { RoomImage } from '../src/modules/room/entities/room-image.entity'
import { UserPayment } from '../src/modules/payment/entities/user-payment.entity'
import { RoomPayment } from '../src/modules/payment/entities/room-payment.entity'
import { PersonnelVehicle } from '../src/modules/personnel-vehicle/entities/personnel-vehicle.entity'
import {
  importPersonnelVehicles,
  VehicleImportReport,
} from '../src/modules/personnel-vehicle/personnel-vehicle-import.helper'

function printReport(report: VehicleImportReport) {
  console.log(
    `สำเร็จ: ${report.success} | ข้าม: ${report.skipped.length} | แจ้งเตือน: ${report.warnings.length} | error: ${report.errors.length}`,
  )
  report.skipped.forEach((s) => console.warn(`SKIP ${s.source}: ${s.reason}`))
  report.warnings.forEach((w) => console.warn(`WARN ${w.source}: ${w.reason}`))
  report.errors.forEach((e) => console.error(`ERROR ${e.source}: ${e.error}`))
}

async function bootstrap() {
  const xlsxPath = process.argv[2]
  if (!xlsxPath) {
    console.error('ใช้: npm run import:personnel-vehicles -- <path-to-xlsx>')
    process.exit(1)
  }

  const dataSource = new DataSource({
    type: (process.env.DB_TYPE || 'postgres') as 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '101135',
    database: process.env.DB_DATABASE || 'army_area',
    entities: [
      Personnel,
      PersonnelsGroup,
      Room,
      RoomImage,
      UserPayment,
      RoomPayment,
      PersonnelVehicle,
    ],
    synchronize: false,
  })

  await dataSource.initialize()
  try {
    const buffer = fs.readFileSync(xlsxPath)
    const report = await importPersonnelVehicles(dataSource, buffer)
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
