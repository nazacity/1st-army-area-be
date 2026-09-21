import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { parse } from 'csv-parse'
import { DataSource } from 'typeorm'
import { Crypto } from 'src/utils/crypto'
import {
  Personnel,
  PersonnelType,
} from '../personnel/entities/personnel.entity'
import { PersonnelsGroup } from '../personnel-group/entities/personnel-group.entity'
import { Room } from '../room/entities/room.entity'
import {
  PersonnelAdmin,
  PersonnelAdminRole,
} from '../personnel-admin/entities/personnel-admin.entity'
import {
  ensureGroups,
  ensureRooms,
  normalizeBranch,
  normalizePhone,
} from '../personnel/personnel-import.helper'
import { UserPayment } from '../payment/entities/user-payment.entity'
import { RoomImage } from '../room/entities/room-image.entity'
import { RoomPayment } from '../payment/entities/room-payment.entity'
import { Survey2User } from '../survey2/entities/survey2-user.entity'
import { Survey2UserAnswer } from '../survey2/entities/survey2-user-answer.entity'
import { Survey2UserAnswerText } from '../survey2/entities/survey2-user-answer-text.entity'

export interface BootstrapReport {
  superAdmin: { created: boolean; username: string }
  groups: { total: number; created: number }
  rooms: { total: number; created: number }
  personnel: {
    created: number
    updated: number
    skipped: { username: string; reason: string }[]
    warnings: { username: string; reason: string }[]
    errors: { username: string; error: string }[]
  }
  csvFormat: string
}

const TYPE_MAP: Record<string, string> = {
  'ทบ.': PersonnelType.ARMY,
  'ทร.': PersonnelType.NAVY,
  'ทอ.': PersonnelType.AIR_FORCE,
  'ตร.': PersonnelType.POLICE,
  'สป.': PersonnelType.MOD,
  'บก.ทท.': PersonnelType.JOINT_FORCE,
  'ฉก.ทม.รอ.': PersonnelType.ROYAL_PAGE_GUARD,
  'มิตรประเทศ': PersonnelType.FOREIGN,
}

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async hasSuperAdmin(): Promise<boolean> {
    const count = await this.dataSource.getRepository(PersonnelAdmin).count({
      where: { role: PersonnelAdminRole.SUPER_ADMIN, isDeleted: false },
    })
    return count > 0
  }

  async ensureSuperAdmin(
    username = 'padmin',
    password = 'SuperSecret123',
  ): Promise<{ created: boolean; username: string }> {
    const repo = this.dataSource.getRepository(PersonnelAdmin)
    const exists = await repo.count({
      where: { role: PersonnelAdminRole.SUPER_ADMIN, isDeleted: false },
    })
    if (exists > 0) return { created: false, username }

    const taken = await repo.findOne({
      where: { username: username.toLowerCase(), isDeleted: false },
    })
    const finalUsername = taken ? `${username}1` : username

    await repo.save(
      repo.create({
        username: finalUsername.toLowerCase(),
        password: await Crypto.hash(password),
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '-',
        role: PersonnelAdminRole.SUPER_ADMIN,
        isActive: true,
      }),
    )
    this.logger.log(`bootstrap: created super_admin "${finalUsername}"`)
    return { created: true, username: finalUsername }
  }

  async seedGroupsAndRooms(): Promise<{
    groups: { total: number; created: number }
    rooms: { total: number; created: number }
  }> {
    const groupRepo = this.dataSource.getRepository(PersonnelsGroup)
    const roomRepo = this.dataSource.getRepository(Room)
    const groupsBefore = await groupRepo.count()
    const roomsBefore = await roomRepo.count()

    const groupsMap = await ensureGroups(this.dataSource)
    const roomsMap = await ensureRooms(this.dataSource)

    return {
      groups: { total: groupsMap.size, created: groupsMap.size - groupsBefore },
      rooms: { total: roomsMap.size, created: roomsMap.size - roomsBefore },
    }
  }

  detectCsvFormat(header: string[]): 'A' | 'B' {
    const joined = header.join(',')
    if (joined.includes('ประทับเวลา') || joined.includes('วันเกิด')) return 'A'
    return 'B'
  }

  // mode=replace → hard delete ข้อมูลที่ผูกกับ personnel ก่อน import ทับ
  async replaceAllPersonnelData(): Promise<void> {
    await this.dataSource
      .getRepository(Survey2UserAnswerText)
      .createQueryBuilder()
      .delete()
      .execute()
    await this.dataSource
      .getRepository(Survey2UserAnswer)
      .createQueryBuilder()
      .delete()
      .execute()
    await this.dataSource
      .getRepository(Survey2User)
      .createQueryBuilder()
      .delete()
      .execute()
    await this.dataSource
      .getRepository(UserPayment)
      .createQueryBuilder()
      .delete()
      .execute()
    await this.dataSource
      .getRepository(Personnel)
      .createQueryBuilder()
      .delete()
      .execute()
  }

  // รูปแบบ B — CSV export จากโปรเจ็คนี้ (12 คอลัมน์) + upsert ตาม username
  async importPersonnelExport(
    csvContent: string,
    replace: boolean,
  ): Promise<BootstrapReport['personnel']> {
    const rows = await this.parseRows(csvContent)
    const header = rows[0] ?? []
    const idx = (name: string) => header.findIndex((h) => h.includes(name))

    const iUser = idx('หมายเลขประจำตัว')
    const iRank = idx('ชั้นยศ')
    const iFirst = idx('ชื่อ')
    const iLast = idx('สกุล')
    const iNick = idx('ชื่อเล่น')
    const iType = idx('จำพวก')
    const iBranch = idx('เหล่า')
    const iSf = idx('ฉก')
    const iGroup = idx('พวก')
    const iRoom = idx('ห้อง')
    const iPhone = idx('โทรศัพท์')
    const iEmail = idx('อีเมล')

    const report: BootstrapReport['personnel'] = {
      created: 0,
      updated: 0,
      skipped: [],
      warnings: [],
      errors: [],
    }

    if (iUser < 0 || iFirst < 0 || iLast < 0) {
      throw new Error(
        'รูปแบบ CSV ไม่ถูกต้อง — ต้องมีคอลัมน์ หมายเลขประจำตัว / ชื่อ / สกุล',
      )
    }

    if (replace) await this.replaceAllPersonnelData()

    const groups = await ensureGroups(this.dataSource)
    const rooms = await ensureRooms(this.dataSource)

    const personnelRepo = this.dataSource.getRepository(Personnel)
    const existing = await personnelRepo.find()
    const byUsername = new Map(existing.map((p) => [p.username, p]))

    for (const r of rows.slice(1)) {
      const username = (r[iUser] ?? '').trim()
      if (!username) continue
      try {
        const typeRaw = (r[iType] ?? '').trim()
        const isSfText = (r[iSf] ?? '').trim().toLowerCase()
        const isSfFromCol = ['ใช่', 'y', 'yes', 'true', '✓'].includes(isSfText)
        const type = TYPE_MAP[typeRaw] ?? (typeRaw ? PersonnelType.ARMY : null)

        const roomRaw = (r[iRoom] ?? '').trim()
        const roomNumber = /^\d{3}$/.test(roomRaw) && !/^0+$/.test(roomRaw) ? roomRaw : null
        const groupName = (r[iGroup] ?? '').trim()

        const values = {
          rank: (r[iRank] ?? '').trim() || null,
          firstName: (r[iFirst] ?? '').trim(),
          lastName: (r[iLast] ?? '').trim(),
          nickName: (r[iNick] ?? '').trim() || null,
          type: (type as Personnel['type']) ?? null,
          branchOfService: normalizeBranch(r[iBranch] ?? '') || null,
          isSpecialForces: isSfFromCol || typeRaw.includes('ฉก.'),
          phone: normalizePhone(r[iPhone] ?? ''),
          email: (r[iEmail] ?? '').trim() || null,
          groupId: groupName ? groups.get(groupName) ?? null : null,
          roomId: roomNumber ? rooms.get(roomNumber) ?? null : null,
        }

        const found = byUsername.get(username)
        if (found) {
          await personnelRepo.save({ ...found, ...values })
          report.updated++
        } else {
          const created = await personnelRepo.save(
            personnelRepo.create({ username, ...values, isChangePassword: false }),
          )
          byUsername.set(username, created)
          report.warnings.push({
            username,
            reason:
              'สร้างใหม่จาก CSV แบบ export — ไม่มีวันเกิด → ยังไม่มีรหัสผ่าน (ให้แอดมิน reset-password ภายหลัง)',
          })
          report.created++
        }
      } catch (e) {
        report.errors.push({ username, error: (e as Error).message })
      }
    }
    return report
  }

  private parseRows(csvContent: string): Promise<string[][]> {
    return new Promise((resolve, reject) =>
      parse(
        csvContent,
        { bom: true, trim: true },
        (err, out) => (err ? reject(err) : resolve(out)),
      ),
    )
  }

  // ---------- Full-migration export/import (JSON dump) ----------

  // dump ครบทุก field (รวม password hash + isChangePassword → ผู้ใช้เก็บรหัสเดิมได้)
  // profileImage/ห้อง/พวก = คง UUID + URL เดิม (ไม่อัปโหลดรูปใหม่)
  async exportFullDump() {
    const groups = await this.dataSource.getRepository(PersonnelsGroup).find()
    const rooms = await this.dataSource.getRepository(Room).find()
    const roomImages = await this.dataSource.getRepository(RoomImage).find()
    // password เป็น select:false — ต้อง addSelect เพื่อให้ dump ครบ (ย้าย server แล้ว user เก็บรหัสเดิม)
    const personnel = await this.dataSource
      .getRepository(Personnel)
      .createQueryBuilder('p')
      .addSelect('p.password')
      .getMany()
    const userPayments = await this.dataSource.getRepository(UserPayment).find()
    const roomPayments = await this.dataSource.getRepository(RoomPayment).find()

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      tables: { groups, rooms, roomImages, personnel, userPayments, roomPayments },
    }
  }

  private async wipeForFullDump(): Promise<void> {
    const wipe = async (entity: any) => {
      await this.dataSource.createQueryBuilder().delete().from(entity).execute()
    }
    await wipe(Survey2UserAnswerText)
    await wipe(Survey2UserAnswer)
    await wipe(Survey2User)
    await wipe(UserPayment)
    await wipe(RoomPayment)
    await wipe(RoomImage)
    await wipe(Personnel)
    await wipe(Room)
    await wipe(PersonnelsGroup)
  }

  // insert ตามลำดับ FK + คง id เดิมทั้งหมด
  async importFullDump(dump: any): Promise<Record<string, number>> {
    // รองรับทั้ง response ที่มี data wrapper และ raw dump
    const raw = dump?.data ?? dump
    const t = raw?.tables
    if (!t?.personnel || !t?.groups || !t?.rooms) {
      throw new Error('ไฟล์ dump ไม่ถูกต้อง — ต้องมี tables.personnel/groups/rooms')
    }

    await this.wipeForFullDump()

    const insertAll = async (entity: any, rows: any[]) => {
      for (let i = 0; i < rows.length; i += 200) {
        await this.dataSource
          .createQueryBuilder()
          .insert()
          .into(entity)
          .values(rows.slice(i, i + 200))
          .execute()
      }
    }

    await insertAll(PersonnelsGroup, t.groups)
    await insertAll(Room, t.rooms)
    await insertAll(Personnel, t.personnel)
    await insertAll(RoomImage, t.roomImages ?? [])
    await insertAll(UserPayment, t.userPayments ?? [])
    await insertAll(RoomPayment, t.roomPayments ?? [])

    return {
      groups: t.groups.length,
      rooms: t.rooms.length,
      roomImages: (t.roomImages ?? []).length,
      personnel: t.personnel.length,
      userPayments: (t.userPayments ?? []).length,
      roomPayments: (t.roomPayments ?? []).length,
    }
  }
}
