import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PersonnelsGroup } from './entities/personnel-group.entity'
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
}
