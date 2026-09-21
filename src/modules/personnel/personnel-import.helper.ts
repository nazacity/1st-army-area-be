// Core import logic — ใช้ร่วมระหว่าง scripts/import-personnel.ts และ POST /personnel/import
// อัลกอริทึม: docs/personnel-system-design.md §7.1–7.2
import { parse } from 'csv-parse'
import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Personnel, PersonnelType } from './entities/personnel.entity'
import { PersonnelsGroup } from '../personnel-group/entities/personnel-group.entity'
import { Room } from '../room/entities/room.entity'

// ---------- Mapping ----------

const ARMY = PersonnelType.ARMY
const NAVY = PersonnelType.NAVY
const AIR_FORCE = PersonnelType.AIR_FORCE
const POLICE = PersonnelType.POLICE
const MOD = PersonnelType.MOD
const JOINT_FORCE = PersonnelType.JOINT_FORCE
const PAGE_GUARD = PersonnelType.ROYAL_PAGE_GUARD
const FOREIGN = PersonnelType.FOREIGN

const TYPE_MAP: Record<string, PersonnelType> = {
  'ทบ.': ARMY,
  'ทร.': NAVY,
  'ทอ.': AIR_FORCE,
  'ตร.': POLICE,
  'สป.': MOD,
  'ทบ., นักบิน': ARMY,
  'นักบิน': ARMY,
  'บก.ทท.': JOINT_FORCE,
  'มิตรประเทศ': FOREIGN,
  'ฉก.ทม.รอ.': PAGE_GUARD,
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

// จำพวก 'ฉก.ทม.รอ.' ตรงตัวเท่านั้น → ROYAL_PAGE_GUARD
// ค่าผสม "ทบ., ฉก.ทม.รอ." = ทบ. ที่เป็น ฉก. → คง ARMY + isSpecialForces = true (§1.2)
export function refineType(type: PersonnelType, sourceTypeRaw: string): PersonnelType {
  if (sourceTypeRaw.trim() === 'ฉก.ทม.รอ.') return PAGE_GUARD
  return type
}

const FOREIGN_COUNTRIES = [
  'มาเลเซีย',
  'อินโดนีเซีย',
  'ลาว',
  'สหรัฐอเมริกา',
  'ออสเตเลีย',
  'จีน',
  'ญี่ปุ่น',
  'ปากีสถาน',
  'เวียดนาม',
  'ฟิลิปปินส์',
]

// กำเนิดของกำลังพลไทย — นอกชุดนี้ = มิตรประเทศ (ใช้ประเทศจากกำเนิด)
const THAI_ORIGINS = ['จปร.', 'นนร.', 'นนอ.', 'นรต.', 'นรพ.', 'กองหนุน', 'นป.']

function resolveCountry(type: PersonnelType, origin: string): string {
  if (origin && !THAI_ORIGINS.some((o) => origin.startsWith(o))) {
    const found = FOREIGN_COUNTRIES.find((c) => origin.includes(c))
    return found ?? origin
  }
  if (type !== FOREIGN) return 'ไทย'
  const found = FOREIGN_COUNTRIES.find((c) => origin.includes(c))
  return found ?? (origin || 'มิตรประเทศ')
}

// ---------- Helpers ----------

function genInitialPassword(dobIso: string): string {
  const [y, m, d] = dobIso.split('-')
  return `${d}${m}${y}` // DDMMYYYY
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
export function normalizePhone(raw: string): string | null {
  const digits = clean(raw).replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 9 && !digits.startsWith('0')) return `0${digits}`
  return digits
}

// สถานะสมรสจากฟอร์มเป็นข้อความยาว ("สมรส (จดทะเบียน) Married (Legally Registered)") → ตัดเหลือไทยสั้น
function normalizeMarital(raw: string): string | null {
  if (!raw) return null
  const map: [RegExp, string][] = [
    [/สมรส.*จดทะเบียน/i, 'สมรส (จดทะเบียน)'],
    [/สมรส.*ไม่ได้จด|De Facto/i, 'สมรส (ไม่ได้จดทะเบียน)'],
    [/โสด|Single/i, 'โสด'],
    [/หย่า|Divorced/i, 'หย่า'],
    [/หม้าย|Widowed/i, 'หม้าย'],
    [/หมั้น|Engaged/i, 'หมั้น'],
  ]
  for (const [re, label] of map) {
    if (re.test(raw)) return label
  }
  return raw
}

// ยศตำรวจ ≈ ยศทบ.: พ.ต.ต. ≈ พ.ต., พ.ต.ท. ≈ พ.ท. (§1.2 — แก้เป็นรายคนได้ภายหลัง)
// ไม่ map 'Major' — CSV ใหม่ยศมิตรเป็น 'Maj.' คงค่าไว้
const RANK_MAP: Record<string, string> = {
  'พ.ต': 'พ.ต.',
  พันตรี: 'พ.ต.',
  'พ.ต.ต.': 'พ.ต.',
  'พ.ต.ท.': 'พ.ท.',
}

function normalizeRank(rank: string): string {
  const r = rank.trim()
  return RANK_MAP[r] ?? r
}

// ตัดคำนำหน้าเหล่า + แก้ typo: "เหล่สทหารสารบรรณ" → "สารบรรณ", "เหล่าทหารม้าาาา" → "ม้า" (§7.2)
export function normalizeBranch(raw: string): string {
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

export async function ensureGroups(
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

export async function ensureRooms(
  dataSource: DataSource,
): Promise<Map<string, string>> {
  const repo = dataSource.getRepository(Room)
  const existing = await repo.find()
  const byNumber = new Map(existing.map((r) => [r.roomNumber, r]))
  for (let floor = 2; floor <= 7; floor++) {
    for (let n = 1; n <= 10; n++) {
      const roomNumber = `${floor}${String(n).padStart(2, '0')}`
      if (!byNumber.has(roomNumber)) {
        await repo.save(repo.create({ roomNumber, floor, capacity: 6 }))
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

// ---------- Row parsing (ใช้ร่วม import / import-update) ----------

export interface ParsedRow {
  username: string
  citizenId: string
  citizenIdNormalized: string | null
  militaryId: string | null
  dob: string | null
  sourceTypeRaw: string
  type: PersonnelType
  values: Partial<Personnel>
}

// CSV ใหม่ 30 คอลัมน์: [2]เลข [3]พวก [13]จำพวก [14]เหล่า [15]สังกัดเดิม [11]กำเนิด [25]วันเกิด
export function parsePersonnelRow(
  r: string[],
  groups: Map<string, string>,
  rooms: Map<string, string>,
): ParsedRow | null {
  if (r.length < 25 || !clean(r[2])) return null
  const username = clean(r[2])
  const citizenId = clean(r[18]).replace(/\D/g, '')
  const militaryRaw = clean(r[19])
  const militaryId = militaryRaw && militaryRaw !== '-' ? militaryRaw : null
  const branch = clean(r[14])
  const unit = clean(r[15])
  const origin = clean(r[11])
  const dob = parseDob(clean(r[25]))

  // map ตรงตัวก่อน ค่าผสม ("ทบ., ฉก.ทม.รอ." / "มิตรเหล่า(...), ฉก.ทม.รอ.") → infer จากเหล่า+สังกัดเดิม
  const sourceTypeRaw = clean(r[13])
  const type = refineType(
    TYPE_MAP[sourceTypeRaw] ?? inferType(branch, unit),
    sourceTypeRaw,
  )
  const isSpecialForces = sourceTypeRaw.includes('ฉก.')

  // ห้อง: 0/000/''/นอกช่วง 201–710 = ไม่มีห้องพัก (พักภายนอก)
  const roomRaw = clean(r[16])
  const roomNumber =
    /^\d{3}$/.test(roomRaw) && !/^0+$/.test(roomRaw) ? roomRaw : null

  const groupName = clean(r[3])

  const values: Partial<Personnel> = {
    citizenId: citizenId.length === 13 ? citizenId : null,
    dateOfBirth: dob ? toNoonBangkokDate(dob) : null,
    type,
    country: resolveCountry(type, origin),
    sourceTypeRaw,
    isSpecialForces,
    branchOfService: normalizeBranch(branch),
    rank: normalizeRank(clean(r[4])),
    firstName: clean(r[5]),
    lastName: clean(r[6]),
    nickName: clean(r[7]) || null,
    phone: normalizePhone(r[8]),
    email: clean(r[9]) || null,
    lineId: clean(r[10]) || null,
    origin: origin || null,
    preCadetClass:
      clean(r[12]) && clean(r[12]) !== '-' ? clean(r[12]) : null,
    unitBeforeCourse: unit || null,
    address: clean(r[17]) || null,
    militaryId,
    maritalStatus: normalizeMarital(clean(r[20])),
    weight: clean(r[21]) ? Number(clean(r[21])) : null,
    height: clean(r[22]) ? Number(clean(r[22])) : null,
    bloodType: clean(r[23]) || null,
    medicalConditions: clean(r[24]) || null,
    remark: clean(r[29]) || null,
    vehicleRegistration: clean(r[27]) || null,
    homeProvince:
      clean(r[28]) && clean(r[28]) !== 'มิตรประเทศ' ? clean(r[28]) : null,
    groupId: groupName ? groups.get(groupName) ?? null : null,
    roomId: roomNumber ? rooms.get(roomNumber) ?? null : null,
  }

  return {
    username,
    citizenId,
    citizenIdNormalized: citizenId.length === 13 ? citizenId : null,
    militaryId,
    dob,
    sourceTypeRaw,
    type,
    values,
  }
}

export async function parseCsv(csvContent: string): Promise<string[][]> {
  return new Promise((resolve, reject) =>
    parse(
      csvContent,
      { bom: true, trim: true },
      (err, out) => (err ? reject(err) : resolve(out)),
    ),
  )
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

  const rows = await parseCsv(csvContent)
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
    const parsed = parsePersonnelRow(r, groups, rooms)
    if (!parsed) continue
    const { username } = parsed

    try {
      if (seenUsernames.has(username)) {
        report.skipped.push({
          username,
          reason: 'username ซ้ำ (กรอกฟอร์มซ้ำ/มีใน DB)',
        })
        continue
      }

      const { citizenIdNormalized, militaryId, dob } = parsed
      if (citizenIdNormalized && seenCitizenIds.has(citizenIdNormalized)) {
        report.skipped.push({ username, reason: `citizenId ซ้ำ: ${citizenIdNormalized}` })
        continue
      }
      if (militaryId && seenMilitaryIds.has(militaryId)) {
        report.skipped.push({ username, reason: `militaryId ซ้ำ: ${militaryId}` })
        continue
      }

      const personnel = personnelRepo.create({
        username,
        ...parsed.values,
        isChangePassword: false,
      })

      // รหัสผ่านตั้งต้น = วันเกิด DDMMYYYY (2026-09-19 — เดิมวันเกิด+บัตร 13 หลัก)
      if (dob) {
        personnel.password = await bcrypt.hash(genInitialPassword(dob), 10)
      } else {
        report.warnings.push({
          username,
          reason:
            'วันเกิดไม่ครบ → import สำเร็จแต่ยัง login ไม่ได้ (รหัสตั้งต้น gen จากวันเกิด DDMMYYYY)',
        })
      }

      await personnelRepo.save(personnel)
      seenUsernames.add(username)
      if (citizenIdNormalized) seenCitizenIds.add(citizenIdNormalized)
      if (militaryId) seenMilitaryIds.add(militaryId)
      report.success++
    } catch (e) {
      report.errors.push({ username, error: (e as Error).message })
    }
  }

  return report
}

// ---------- Update ข้อมูลเดิมจาก CSV (match ด้วย username) ----------

// เหมือน importPersonnel แต่ UPDATE รายที่มีอยู่แล้ว (ไม่สร้างใหม่ ไม่แตะ password เดิม)
// — ใช้กับ POST /personnel/import-update (แก้ข้อมูลจากฟอร์ม/CSV ฉบับใหม่ทั้งชุด)
export async function updatePersonnelCsv(
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

  const rows = await parseCsv(csvContent)
  const [, ...dataRows] = rows

  const groups = await ensureGroups(dataSource)
  const rooms = await ensureRooms(dataSource)

  const existing = await personnelRepo.find()
  const byUsername = new Map(existing.map((p) => [p.username, p]))
  const citizenOwner = new Map(
    existing
      .filter((p) => p.citizenId)
      .map((p) => [p.citizenId as string, p.username]),
  )
  const militaryOwner = new Map(
    existing
      .filter((p) => p.militaryId)
      .map((p) => [p.militaryId as string, p.username]),
  )

  for (const r of dataRows) {
    const parsed = parsePersonnelRow(r, groups, rooms)
    if (!parsed) continue
    const { username } = parsed

    try {
      const found = byUsername.get(username)
      if (!found) {
        report.skipped.push({
          username,
          reason: 'ไม่พบ username ในระบบ (update เท่านั้น — ใช้ /import สร้างใหม่)',
        })
        continue
      }

      const { citizenIdNormalized, militaryId, dob } = parsed
      if (
        citizenIdNormalized &&
        citizenOwner.has(citizenIdNormalized) &&
        citizenOwner.get(citizenIdNormalized) !== username
      ) {
        report.skipped.push({
          username,
          reason: `citizenId ซ้ำกับ ${citizenOwner.get(citizenIdNormalized)}: ${citizenIdNormalized}`,
        })
        continue
      }
      if (
        militaryId &&
        militaryOwner.has(militaryId) &&
        militaryOwner.get(militaryId) !== username
      ) {
        report.skipped.push({
          username,
          reason: `militaryId ซ้ำกับ ${militaryOwner.get(militaryId)}: ${militaryId}`,
        })
        continue
      }

      const hadPassword = Boolean(found.password)
      Object.assign(found, parsed.values)

      // คนที่ยังไม่มีรหัส (import ครั้งก่อน DOB ไม่ครบ) → gen ใหม่จาก DOB ใน CSV
      if (!hadPassword && dob) {
        found.password = await bcrypt.hash(genInitialPassword(dob), 10)
      } else if (!hadPassword && !dob) {
        report.warnings.push({
          username,
          reason:
            'วันเกิดไม่ครบและยังไม่มีรหัสผ่าน → ยัง login ไม่ได้ (ต้องแก้ DOB แล้วอัปเดตอีกครั้ง)',
        })
      }

      await personnelRepo.save(found)
      report.success++
    } catch (e) {
      report.errors.push({ username, error: (e as Error).message })
    }
  }

  return report
}
