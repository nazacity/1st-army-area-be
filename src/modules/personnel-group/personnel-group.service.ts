import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PersonnelsGroup } from './entities/personnel-group.entity'
import { Personnel } from '../personnel/entities/personnel.entity'
import { In } from 'typeorm'
import { UpdateGroupMembersDto } from './dto/update-group-members.dto'
import {
  CreatePersonnelGroupDto,
  UpdatePersonnelGroupDto,
} from './dto/personnel-group.dto'

@Injectable()
export class PersonnelGroupService {
  private readonly logger = new Logger(PersonnelGroupService.name)

  constructor(
    @InjectRepository(PersonnelsGroup)
    private readonly groupRepository: Repository<PersonnelsGroup>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  async getGroups(): Promise<{ groups: PersonnelsGroup[]; total: number }> {
    try {
      const [groups, total] = await this.groupRepository.findAndCount({
        where: { isDeleted: false },
        order: { name: 'ASC' },
        relations: ['personnels'],
      })

      return { groups, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getGroupById(id: string): Promise<PersonnelsGroup> {
    try {
      const group = await this.groupRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['personnels'],
      })

      if (!group) throw new Error('Group is not found')

      return group
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createGroup(dto: CreatePersonnelGroupDto): Promise<PersonnelsGroup> {
    try {
      const existing = await this.groupRepository.findOne({
        where: { name: dto.name, isDeleted: false },
      })

      if (existing) throw new Error('Group name is already exist')

      const group = this.groupRepository.create(dto)
      return await this.groupRepository.save(group)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateGroup(
    id: string,
    dto: UpdatePersonnelGroupDto,
  ): Promise<PersonnelsGroup> {
    try {
      const group = await this.groupRepository.findOne({
        where: { id, isDeleted: false },
      })

      if (!group) throw new Error('Group is not found')

      if (dto.name && dto.name !== group.name) {
        const existing = await this.groupRepository.findOne({
          where: { name: dto.name, isDeleted: false },
        })

        if (existing) throw new Error('Group name is already exist')
      }

      const updated = await this.groupRepository.save({ ...group, ...dto })
      return updated
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteGroup(id: string): Promise<PersonnelsGroup> {
    try {
      const group = await this.groupRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['personnels'],
      })

      if (!group) throw new Error('Group is not found')

      const memberCount = (group.personnels ?? []).filter(
        (p) => !p.isDeleted,
      ).length

      if (memberCount > 0) {
        throw new Error('Group still has members, move them out first')
      }

      group.isDeleted = true
      return await this.groupRepository.save(group)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  // แก้สมาชิกพวกด้วยรายชื่อรหัสนักเรียน — เติม/ถอดอัตโนมัติ
async updateGroupMembers(
  id: string,
  usernames: string[],
): Promise<{ added: number; removed: number; group: PersonnelsGroup }> {
  try {
    const group = await this.groupRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!group) throw new Error('Group is not found')

    const codes = Array.from(
      new Set(usernames.map((u) => u.trim()).filter(Boolean)),
    )

    const targets = codes.length
      ? await this.personnelRepository.find({
          where: { username: In(codes), isDeleted: false },
        })
      : []

    const foundCodes = new Set(targets.map((t) => t.username))
    const missing = codes.filter((c) => !foundCodes.has(c))
    if (missing.length) {
      throw new Error(`ไม่พบรหัสนักเรียน: ${missing.join(', ')}`)
    }

    const current = await this.personnelRepository.find({
      where: { groupId: id, isDeleted: false },
    })
    const targetIds = new Set(targets.map((t) => t.id))

    // ถอด: สมาชิกเดิมที่ไม่อยู่ในลิสต์ใหม่
    const toRemove = current.filter((p) => !targetIds.has(p.id))
    for (const p of toRemove) {
      await this.personnelRepository.update(p.id, { groupId: null })
    }

    // เพิ่ม/ย้าย: ตั้ง groupId (ถ้าอยู่พวกอื่น = ย้ายมา)
    let added = 0
    for (const p of targets) {
      if (p.groupId !== id) {
        await this.personnelRepository.update(p.id, { groupId: id })
        added++
      }
    }

    this.logger.log(
      `group "${group.name}" members: kept ${targets.length - added}, added ${added}, removed ${toRemove.length}`,
    )

    return { added: added, removed: toRemove.length, group }
  } catch (error) {
    this.logger.debug(error)
    throw new Error(error)
  }
}
}