import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { Crypto } from 'src/utils/crypto'
import { Personnel, PersonnelType } from './entities/personnel.entity'
import {
  ChangePasswordDto,
  CreatePersonnelDto,
  PersonnelQueryDto,
  UpdateMeDto,
  UpdatePersonnelDto,
} from './dto/personnel.dto'

export function genInitialPassword(
  dateOfBirth: string,
  citizenId: string,
): string {
  // dateOfBirth: ISO YYYY-MM-DD → DDMMYYYY + เลขบัตรประชาชน 13 หลัก
  const [y, m, d] = dateOfBirth.split('-')
  return `${d}${m}${y}${citizenId}`
}

@Injectable()
export class PersonnelService {
  private readonly logger = new Logger(PersonnelService.name)

  constructor(
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  async getPersonnels(query: PersonnelQueryDto): Promise<{
    personnels: Personnel[]
    total: number
  }> {
    try {
      const take = query?.take ? Number(query.take) : 10
      const page = query?.page ? Number(query.page) : 1
      const skip = take === -1 ? undefined : (page - 1) * take

      const qb = this.personnelRepository
        .createQueryBuilder('p')
        .where('p.isDeleted = false')

      if (query?.groupId) {
        qb.andWhere('p.groupId = :groupId', { groupId: query.groupId })
      }
      if (query?.roomId) {
        qb.andWhere('p.roomId = :roomId', { roomId: query.roomId })
      }
      if (query?.type) {
        qb.andWhere('p.type = :type', { type: query.type })
      }
      if (query?.isSpecialForces !== undefined) {
        qb.andWhere('p.isSpecialForces = :isf', {
          isf: query.isSpecialForces === 'true',
        })
      }
      if (query?.searchText) {
        qb.andWhere(
          new Brackets((qb2) => {
            qb2
              .where('p.username ILIKE :search')
              .orWhere('p.firstName ILIKE :search')
              .orWhere('p.lastName ILIKE :search')
              .orWhere('p.nickName ILIKE :search')
          }),
        )
        qb.setParameter('search', `%${query.searchText}%`)
      }

      qb.orderBy('p.createdAt', 'DESC')
      if (skip !== undefined) {
        qb.skip(skip).take(take)
      }

      const [personnels, total] = await qb.getManyAndCount()
      return { personnels, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getPersonnelById(id: string): Promise<Personnel> {
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['group', 'room'],
      })

      return personnel
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async verifyPersonnel(username: string, password: string): Promise<Personnel> {
    try {
      const personnel = await this.personnelRepository
        .createQueryBuilder('p')
        .addSelect('p.password')
        .where('p.isDeleted = false')
        .andWhere(
          new Brackets((qb) => {
            qb.where('p.username = :username').orWhere(
              'p.schoolEmail = :username',
            )
          }),
        )
        .setParameter('username', username)
        .getOne()

      if (
        !personnel ||
        !personnel.password ||
        !Crypto.compare(password, personnel.password)
      ) {
        throw new Error('Verify failed')
      }

      return personnel
    } catch (error) {
      this.logger.debug(error)
      throw new Error('Verify failed')
    }
  }

  async updateMe(id: string, dto: UpdateMeDto): Promise<Personnel> {
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id, isDeleted: false },
      })

      if (!personnel) throw new Error('Personnel is not found')

      const updated = await this.personnelRepository.save({
        ...personnel,
        ...dto,
      })

      return updated
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async changePassword(
    id: string,
    dto: ChangePasswordDto,
  ): Promise<Personnel> {
    try {
      if (dto.newPassword !== dto.confirmPassword) {
        throw new Error('New password and confirm password are not matched')
      }
      if (!/\d/.test(dto.newPassword)) {
        throw new Error('New password must contain at least 1 number')
      }
      if (dto.oldPassword === dto.newPassword) {
        throw new Error('New password must be different from old password')
      }

      const personnel = await this.personnelRepository
        .createQueryBuilder('p')
        .addSelect('p.password')
        .where('p.id = :id', { id })
        .andWhere('p.isDeleted = false')
        .getOne()

      if (!personnel || !Crypto.compare(dto.oldPassword, personnel.password)) {
        throw new Error('Old password is incorrect')
      }

      personnel.password = await Crypto.hash(dto.newPassword)
      personnel.isChangePassword = true

      return await this.personnelRepository.save(personnel)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createPersonnel(dto: CreatePersonnelDto): Promise<Personnel> {
    try {
      await this.assertUniqueFields(dto)

      if (!dto.citizenId || !dto.dateOfBirth) {
        throw new Error('dateOfBirth and citizenId are required for initial password')
      }

      const personnel = this.personnelRepository.create({
        ...dto,
        weight: dto.weight ? Number(dto.weight) : null,
        height: dto.height ? Number(dto.height) : null,
        password: Crypto.hash(
          genInitialPassword(dto.dateOfBirth, dto.citizenId),
        ),
        isChangePassword: false,
      })

      const saved = await this.personnelRepository.save(personnel)
      delete (saved as any).password
      return saved
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updatePersonnel(
    id: string,
    dto: UpdatePersonnelDto,
  ): Promise<Personnel> {
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id, isDeleted: false },
      })

      if (!personnel) throw new Error('Personnel is not found')

      await this.assertUniqueFields(dto, id)

      const updated = await this.personnelRepository.save({
        ...personnel,
        ...dto,
        weight:
          dto.weight !== undefined
            ? dto.weight
              ? Number(dto.weight)
              : null
            : personnel.weight,
        height:
          dto.height !== undefined
            ? dto.height
              ? Number(dto.height)
              : null
            : personnel.height,
      })

      return updated
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deletePersonnel(id: string): Promise<Personnel> {
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id, isDeleted: false },
      })

      if (!personnel) throw new Error('Personnel is not found')

      personnel.isDeleted = true
      return await this.personnelRepository.save(personnel)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async resetPassword(id: string): Promise<Personnel> {
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id, isDeleted: false },
      })

      if (!personnel) throw new Error('Personnel is not found')
      if (!personnel.dateOfBirth || !personnel.citizenId) {
        throw new Error(
          'Cannot reset password: dateOfBirth or citizenId is missing',
        )
      }

      personnel.password = Crypto.hash(
        genInitialPassword(personnel.dateOfBirth, personnel.citizenId),
      )
      personnel.isChangePassword = false

      return await this.personnelRepository.save(personnel)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  private async assertUniqueFields(
    dto: CreatePersonnelDto | UpdatePersonnelDto,
    excludeId?: string,
  ): Promise<void> {
    const fields = [
      'username',
      'citizenId',
      'militaryId',
      'schoolEmail',
      'lineUserId',
    ] as const

    for (const field of fields) {
      const value = dto[field]
      if (!value) continue

      const existing = await this.personnelRepository.findOne({
        where: { [field]: value, isDeleted: false },
      })

      if (existing && existing.id !== excludeId) {
        throw new Error(`${field} is already in use`)
      }
    }
  }
}
