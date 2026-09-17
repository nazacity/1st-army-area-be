// Core import logic — ใช้ร่วมระหว่าง scripts/import-personnel.ts และ POST /personnel/import
// อัลกอริทึม: docs/personnel-system-design.md §7.1–7.2
import { parse } from 'csv-parse'
import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Personnel, PersonnelType } from './entities/personnel.entity'
import { PersonnelsGroup } from '../personnel-group/entities/personnel-group.entity'
import { Room } from '../room/entities/room.entity'

// ---------- Mapping ----------

const ARMY = PersonnelType['ทบ.']
const NAVY = PersonnelType['ทร.']
const AIR_FORCE = PersonnelType['ทอ.']
const POLICE = PersonnelType['ตร.']
const FOREIGN = PersonnelType['มิตรประเทศ']

const TYPE_MAP: Record<string, PersonnelType> = {
  'ทบ.': ARMY,
  'ทร.': NAVY,
  'ทอ.': AIR_FORCE,
  'ตร.': POLICE,
  'สป.': ARMY,
  'ทบ., นักบิน': ARMY,
  'นักบิน': ARMY,
  'บก.ทท.': ARMY,
  'มิตรประเทศ': FOREIGN,
  'ฉก.ทม.รอ.': ARMY,
}

// มิตรเหล่า(ทอ./ทร./ตร.) + ค่าที่ map ไม่ตรง → infer จากเหล่า + สังกัดเดิม (§1.2)
function inferType(branch: string, unit: string): PersonnelType {
  const s = `${branch} ${unit}`
  if (/กองทัพเรือ|นาวิกโยธิน|กองเรือ|กรมทหารเรือ/.test(s)) return NAVY
  if (/กองทัพอากาศ|กองบิน(?!ที่)|นักบินกองทัพอากาศ/.test(s))
    return AIR_FORCE
  if (/ตำรวจ|บช\.|ภูธร|ตชด\./.test(s)) return POLICE
  return ARMY
}

const FOREIGN_COUNTRIES = ['มาเลเซีย', 'อินโดนีเซีย', 'ลาว', 'สหรัฐอเมริกา']

function resolveCountry(type: PersonnelType, origin: string): string {
  if (type !== FOREIGN) return 'ไทย'
  const found = FOREIGN_COUNTRIES.find((c) => origin.includes(c))
  return found ?? (origin || 'มิตรประเทศ')
}

// ---------- Helpers ----------

function genInitialPassword(dobIso: string, citizenId: string): string {
  const [y, m, d] = dobIso.split('-')
  return `${d}${m}${y}${citizenId}` // DDMMYYYY + เลขบัตร 13 หลัก
}

function parseDob(dob: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dob.trim())
  if (!m) return null
  const [, d, mo, y] = m
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
}

// ISO YYYY-MM-DD → Date เที่ยงวัน Asia/Bangkok กัน timezone เพี้ยนวัน
export function toNoonBangkokDate(dobIso: string): Date {
  return new Date(`${dobIso}T12:00:00+07:00`)
}

// เบอร์โทร: กันเลข 0 หาย (Excel/CSV numeric coercion) — เลข 9 หลักไม่มี 0 นำ → เติม 0
function normalizePhone(raw: string): string | null {
  const digits = clean(raw).replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 9 && !digits.startsWith('0')) return `0${digits}`
  return digits
}

// ยศตำรวจ ≈ ยศทบ.: พ.ต.ต. ≈ พ.ต., พ.ต.ท. ≈ พ.ท. (§1.2 — แก้เป็นรายคนได้ภายหลัง)
const RANK_MAP: Record<string, string> = {
  'พ.ต': 'พ.ต.',
  พันตรี: 'พ.ต.',
  Major: 'พ.ต.',
  'พ.ต.ต.': 'พ.ต.',
  'พ.ต.ท.': 'พ.ท.',
}

function normalizeRank(rank: string): string {
  const r = rank.trim()
  return RANK_MAP[r] ?? r
}

// ตัดคำนำหน้าเหล่า + แก้ typo: "เหล่สทหารสารบรรณ" → "สารบรรณ", "เหล่าทหารม้าาาา" → "ม้า" (§7.2)
function normalizeBranch(raw: string): string {
  const b = raw
    .trim()
    .replace(/เหล่ส/g, 'เหล่า')
    .replace(/ทหาราบ/g, 'ทหารราบ')
    .replace(/(.)\1{2,}/g, '$1')
    .replace(/เหล่าทหาร/g, '')
    .replace(/^เหล่า/, '')
    .replace(/^ทหาร/, '')
    .trim()
  return b || raw.trim()
}

const clean = (v: string | undefined): string => (v ?? '').trim()

// ---------- Seed (idempotent) ----------

async function ensureGroups(
  dataSource: DataSource,
): Promise<Map<string, string>> {
  const repo = dataSource.getRepository(PersonnelsGroup)
  for (let i = 1; i <= 9; i++) {
    const name = String(i)
    if (!(await repo.findOne({ where: { name } }))) {
      await repo.save(repo.create({ name }))
    }
  }
  return new Map((await repo.find()).map((g) => [g.name, g.id]))
}

async function ensureRooms(
  dataSource: DataSource,
): Promise<Map<string, string>> {
  const repo = dataSource.getRepository(Room)
  const existing = await repo.find()
  const byNumber = new Map(existing.map((r) => [r.roomNumber, r]))
  for (let floor = 2; floor <= 7; floor++) {
    for (let n = 1; n <= 10; n++) {
      const roomNumber = `${floor}${String(n).padStart(2, '0')}`
      if (!byNumber.has(roomNumber)) {
        await repo.save(repo.create({ roomNumber, floor, capacity: 2 }))
      }
    }
  }
  return new Map((await repo.find()).map((r) => [r.roomNumber, r.id]))
}

// ---------- Main ----------

export interface ImportReport {
  success: number
  skipped: { username: string; reason: string }[]
  errors: { username: string; error: string }[]
  warnings: { username: string; reason: string }[]
}

export async function importPersonnel(
  dataSource: DataSource,
  csvContent: string,
): Promise<ImportReport> {
  const personnelRepo = dataSource.getRepository(Personnel)
  const report: ImportReport = {
    success: 0,
    skipped: [],
    errors: [],
    warnings: [],
  }

  const rows: string[][] = await new Promise((resolve, reject) =>
    parse(
      csvContent,
      { bom: true, trim: true },
      (err, out) => (err ? reject(err) : resolve(out)),
    ),
  )
  const [, ...dataRows] = rows

  const groups = await ensureGroups(dataSource)
  const rooms = await ensureRooms(dataSource)

  const seenUsernames = new Set<string>(
    (
      await personnelRepo.find({ select: { username: true } })
    ).map((p) => p.username),
  )
  const loadUnique = async (field: string) =>
    new Set(
      (
        await personnelRepo
          .createQueryBuilder('p')
          .select(`p.${field}`, 'v')
          .getRawMany()
      ).map((r) => r.v),
    )
  const seenCitizenIds = await loadUnique('citizenId')
  const seenMilitaryIds = await loadUnique('militaryId')

  for (const r of dataRows) {
    if (r.length < 20 || !clean(r[1])) continue
    const username = clean(r[1])

    try {
      if (seenUsernames.has(username)) {
        report.skipped.push({
          username,
          reason: 'username ซ้ำ (กรอกฟอร์มซ้ำ/มีใน DB)',
        })
        continue
      }

      const citizenId = clean(r[17]).replace(/\D/g, '')
      const militaryId = clean(r[18]) || null
      if (citizenId && seenCitizenIds.has(citizenId)) {
        report.skipped.push({ username, reason: `citizenId ซ้ำ: ${citizenId}` })
        continue
      }
      if (militaryId && seenMilitaryIds.has(militaryId)) {
        report.skipped.push({ username, reason: `militaryId ซ้ำ: ${militaryId}` })
        continue
      }

      const sourceTypeRaw = clean(r[12])
      const branch = clean(r[13])
      const unit = clean(r[14])
      const origin = clean(r[10])
      const dob = parseDob(clean(r[24]))

      // ค่าผสม ("ทบ., ฉก.ทม.รอ.") = ติ๊กคร่อม → ใช้ case ฉก. (§1.2)
      const typeKey = sourceTypeRaw.includes('ฉก.') ? 'ฉก.ทม.รอ.' : sourceTypeRaw
      const type = TYPE_MAP[typeKey] ?? inferType(branch, unit)
      const isSpecialForces = sourceTypeRaw.includes('ฉก.')

      // ห้อง: 0/000/0000/'' = ไม่มีห้องพัก
      const roomRaw = clean(r[15])
      const roomNumber =
        /^\d{3}$/.test(roomRaw) && !/^0+$/.test(roomRaw) ? roomRaw : null

      const groupName = clean(r[2])
      const groupId = groupName ? groups.get(groupName) ?? null : null

      const personnel = personnelRepo.create({
        username,
        citizenId: citizenId.length === 13 ? citizenId : null,
        dateOfBirth: dob ? toNoonBangkokDate(dob) : null,
        type,
        country: resolveCountry(type, origin),
        sourceTypeRaw,
        isSpecialForces,
        branchOfService: normalizeBranch(branch),
        rank: normalizeRank(clean(r[3])),
        firstName: clean(r[4]),
        lastName: clean(r[5]),
        nickName: clean(r[6]) || null,
        phone: normalizePhone(r[7]),
        email: clean(r[8]) || null,
        lineId: clean(r[9]) || null,
        origin: origin || null,
        preCadetClass:
          clean(r[11]) && clean(r[11]) !== '-' ? clean(r[11]) : null,
        unitBeforeCourse: unit || null,
        address: clean(r[16]) || null,
        militaryId,
        maritalStatus: clean(r[19]) || null,
        weight: clean(r[20]) ? Number(clean(r[20])) : null,
        height: clean(r[21]) ? Number(clean(r[21])) : null,
        bloodType: clean(r[22]) || null,
        medicalConditions: clean(r[23]) || null,
        remark: clean(r[25]) || null,
        vehicleRegistration: clean(r[26]) || null,
        homeProvince:
          clean(r[27]) && clean(r[27]) !== 'มิตรประเทศ' ? clean(r[27]) : null,
        groupId,
        roomId: roomNumber ? rooms.get(roomNumber) ?? null : null,
        isChangePassword: false,
      })

      if (dob && citizenId.length === 13) {
        personnel.password = await bcrypt.hash(
          genInitialPassword(dob, citizenId),
          10,
        )
      } else {
        report.warnings.push({
          username,
          reason:
            'DOB/citizenId ไม่ครบ → import สำเร็จแต่ยัง login ไม่ได้ (ต้องแก้ข้อมูลก่อน)',
        })
      }

      await personnelRepo.save(personnel)
      seenUsernames.add(username)
      if (citizenId) seenCitizenIds.add(citizenId)
      if (militaryId) seenMilitaryIds.add(militaryId)
      report.success++
    } catch (e) {
      report.errors.push({ username, error: (e as Error).message })
    }
  }

  return report
}
