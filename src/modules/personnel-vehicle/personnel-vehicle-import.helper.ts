// Core import logic สำหรับ POST /personnel-vehicle/import
// รูปแบบไฟล์: Excel sheet "รายการยานพาหนะ" — header แถว 3
// คอลัมน์: หมายเลข, ยศ-ชื่อ-สกุล, พวก, หมายเลขทะเบียน, จังหวัด,
//          ประเภทยานพาหนะ, ยี่ห้อ, รุ่น, สี, ชื่อเจ้าของรถ
// Insert-only: ไม่ลบข้อมูลเดิม (ผู้ใช้อาจเพิ่มรถเองแล้ว) — แถวซ้ำ = skipped
import * as XLSX from 'xlsx'
import { DataSource } from 'typeorm'
import { Personnel } from '../personnel/entities/personnel.entity'
import {
  PersonnelVehicle,
  PersonnelVehicleType,
} from './entities/personnel-vehicle.entity'

export interface VehicleImportReport {
  success: number
  skipped: { source: string; reason: string }[]
  warnings: { source: string; reason: string }[]
  errors: { source: string; error: string }[]
}

const TYPE_MAP: Record<string, PersonnelVehicleType> = {
  'รถยนต์นั่งส่วนบุคคล': PersonnelVehicleType.CAR,
  'รถกระบะ': PersonnelVehicleType.PICKUP,
  'รถจักรยานยนต์': PersonnelVehicleType.MOTORCYCLE,
  '(ไม่ระบุ)': PersonnelVehicleType.UNSPECIFIED,
}

function mapVehicleType(raw: string): {
  type: PersonnelVehicleType
  warned: boolean
} {
  const value = normalize(raw)
  if (TYPE_MAP[value]) return { type: TYPE_MAP[value], warned: false }
  if (/กระบะ/.test(value)) return { type: PersonnelVehicleType.PICKUP, warned: false }
  if (/จักรยานยนต์|มอเตอร์ไซ/.test(value))
    return { type: PersonnelVehicleType.MOTORCYCLE, warned: false }
  if (/รถยนต์|รถเก๋ง/.test(value)) return { type: PersonnelVehicleType.CAR, warned: false }
  return { type: PersonnelVehicleType.UNSPECIFIED, warned: Boolean(value) }
}

function normalize(value: string): string {
  return (value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim()
}

// 'พ.ต.' == 'พต' — ใช้เทียบยศตอนชื่อซ้ำหลายคน
function normalizeRank(rank: string): string {
  return normalize(rank).replace(/[\s.]/g, '')
}

// 'พ.ต. กนก บุญผล' → ['พ.ต.', 'กนก', 'บุญผล'] (ยศอาจมีหลายพยางค์เช่น 'พ.อ.หญิง')
function parseFullName(raw: string): { rank: string; firstName: string; lastName: string } | null {
  const tokens = normalize(raw).split(' ').filter(Boolean)
  if (tokens.length < 3) return null
  return {
    rank: tokens[0],
    firstName: tokens.slice(1, -1).join(' '),
    lastName: tokens[tokens.length - 1],
  }
}

export async function importPersonnelVehicles(
  dataSource: DataSource,
  fileBuffer: Buffer,
): Promise<VehicleImportReport> {
  const vehicleRepo = dataSource.getRepository(PersonnelVehicle)
  const personnelRepo = dataSource.getRepository(Personnel)

  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  const sheetName =
    workbook.SheetNames.find((name) => name === 'รายการยานพาหนะ') ??
    workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  // raw:false → ทะเบียน/เบอร์ที่เป็นตัวเลขล้วนไม่ถูกแปลงเป็น number
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
  })

  const personnels = await personnelRepo.find({ where: { isDeleted: false } })
  const byUsername = new Map(personnels.map((p) => [p.username, p]))
  const byName = new Map<string, Personnel[]>()
  for (const p of personnels) {
    const key = `${normalize(p.firstName)}|${normalize(p.lastName)}`
    byName.set(key, [...(byName.get(key) ?? []), p])
  }

  const existingVehicles = await vehicleRepo.find({ where: { isDeleted: false } })
  const existingPlates = new Set(
    existingVehicles.map((v) => `${v.personnelId}|${normalize(v.licensePlate)}`),
  )

  const report: VehicleImportReport = {
    success: 0,
    skipped: [],
    warnings: [],
    errors: [],
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const firstCell = normalize(row[0])
    const plateCell = normalize(row[3])
    // header/title แถวบน + แถวว่าง
    if (!/^\d+$/.test(firstCell) && !plateCell) continue

    const source = `แถว ${i + 1}: ${plateCell || firstCell}`

    // แถว header ของ template (หมายเลข | ยศ-ชื่อ-สกุล | …) — ไม่รายงานเป็น skipped
    if (!/^\d+$/.test(firstCell) && normalize(row[1]) === 'ยศ-ชื่อ-สกุล') continue

    try {
      if (!plateCell) {
        report.skipped.push({ source, reason: 'ไม่มีเลขทะเบียน' })
        continue
      }

      let personnel = byUsername.get(firstCell) ?? null
      if (!personnel) {
        const name = parseFullName(row[1])
        if (!name) {
          report.skipped.push({ source, reason: `ไม่สามารถอ่านชื่อ: ${normalize(row[1])}` })
          continue
        }
        const candidates =
          byName.get(`${normalize(name.firstName)}|${normalize(name.lastName)}`) ?? []
        if (candidates.length === 1) {
          personnel = candidates[0]
        } else if (candidates.length > 1) {
          personnel =
            candidates.find((c) => normalizeRank(c.rank) === normalizeRank(name.rank)) ??
            null
        }
        if (!personnel) {
          report.skipped.push({
            source,
            reason: `ไม่พบ นทน. ในระบบ: ${normalize(row[1])}`,
          })
          continue
        }
      }

      const { type, warned } = mapVehicleType(row[5])
      if (warned) {
        report.warnings.push({
          source,
          reason: `ประเภทยานพาหนะไม่รู้จัก: ${normalize(row[5])} → (ไม่ระบุ)`,
        })
      }

      const plateKey = `${personnel.id}|${plateCell}`
      if (existingPlates.has(plateKey)) {
        report.skipped.push({ source, reason: 'ทะเบียนซ้ำในระบบ' })
        continue
      }

      const vehicle = vehicleRepo.create({
        licensePlate: plateCell,
        province: normalize(row[4]) || null,
        type,
        brand: normalize(row[6]) || null,
        model: normalize(row[7]) || null,
        color: normalize(row[8]) || null,
        ownerFullName: normalize(row[9]) || null,
        personnelId: personnel.id,
      })
      await vehicleRepo.save(vehicle)
      existingPlates.add(plateKey)
      report.success++
    } catch (error) {
      report.errors.push({ source, error: error.message })
    }
  }

  return report
}
