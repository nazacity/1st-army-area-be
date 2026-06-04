import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { NotUnitUser } from './entities/not-unit-user.entity'
import { NotUnitUserDocument } from 'src/modules/not-unit-user-document/entities/not-unit-user-document.entity'
import {
  NotUnitUserCreateDto,
  NotUnitUserQueryDto,
  NotUnitUserUpdateDto,
} from './dto/not-unit-user.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class NotUnitUserService {
  private readonly logger = new Logger(NotUnitUserService.name)
  constructor(
    @InjectRepository(NotUnitUser)
    private readonly notUnitUserRepository: Repository<NotUnitUser>,
    @InjectRepository(NotUnitUserDocument)
    private readonly documentRepository: Repository<NotUnitUserDocument>,
  ) {}

  async createNotUnitUser(dto: NotUnitUserCreateDto, adminId?: string): Promise<NotUnitUser> {
    this.logger.log('create-not-unit-user')
    try {
      const { documents, unitUserId, buildId, ...rest } = dto

      if (rest.idCardNo) {
        const existing = await this.notUnitUserRepository.findOne({
          where: { idCardNo: rest.idCardNo },
        })
        if (existing) {
          throw new ConflictException(`Not unit user with id card "${rest.idCardNo}" already exists`)
        }
      }

      const entity = this.notUnitUserRepository.create({
        ...rest,
        unitUser: unitUserId ? { id: unitUserId } : undefined,
        building: buildId ? { id: buildId } : undefined,
        ...(adminId && { createdBy: { id: adminId }, updatedBy: { id: adminId } }),
      })
      const saved = await this.notUnitUserRepository.save(entity)

      if (documents?.length) {
        const docEntities = documents.map((doc) =>
          this.documentRepository.create({ ...doc, notUnitUser: { id: saved.id } }),
        )
        await this.documentRepository.save(docEntities)
      }

      return this.getNotUnitUserById(saved.id)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAllNotUnitUsers(
    query: NotUnitUserQueryDto,
    adminUnitIds: string[] = [],
  ): Promise<{ data: NotUnitUser[]; total: number }> {
    this.logger.log('get-all-not-unit-users')
    try {
      const { take, skip } = paginationUtil(query)
      const shouldFilterByUnit = adminUnitIds.length > 0

      if (query.electionLocation === 'อื่นๆ') {
        const qb = this.notUnitUserRepository.createQueryBuilder('nu')
          .leftJoinAndSelect('nu.unitUser', 'unitUser')
          .leftJoinAndSelect('unitUser.unit', 'unitUserUnit')
          .leftJoinAndSelect('nu.building', 'building')
          .leftJoinAndSelect('nu.documents', 'documents')
          .where('nu.isDeleted = :isDeleted', { isDeleted: false })
          .andWhere('nu.electionLocation NOT IN (:...locations)', { locations: ['พื้นที่สนามเป้า', 'พื้นที่สระบุรี'] })

        if (shouldFilterByUnit) qb.andWhere('unitUserUnit.id IN (:...adminUnitIds)', { adminUnitIds })

        if (query.status) qb.andWhere('nu.status = :status', { status: query.status })
        if (query.unitUserId) qb.andWhere('nu.unitUserId = :unitUserId', { unitUserId: query.unitUserId })
        if (query.buildId) qb.andWhere('nu.buildingId = :buildId', { buildId: query.buildId })
        if (query.searchText) qb.andWhere('(nu.firstName ILIKE :search OR nu.lastName ILIKE :search)', { search: `%${query.searchText}%` })

        const [data, total] = await qb.orderBy('nu.createdAt', 'DESC').take(take).skip(skip).getManyAndCount()
        return { data, total }
      }

      const [data, total] = await this.notUnitUserRepository.findAndCount({
        where: [
          {
            isDeleted: false,
            ...(query.status && { status: query.status }),
            ...(query.unitUserId && { unitUser: { id: query.unitUserId } }),
            ...(query.buildId && { building: { id: query.buildId } }),
            ...(query.electionLocation && { electionLocation: query.electionLocation }),
            ...(query.searchText && {
              firstName: Like(`%${query.searchText}%`),
            }),
          },
          {
            isDeleted: false,
            ...(query.status && { status: query.status }),
            ...(query.unitUserId && { unitUser: { id: query.unitUserId } }),
            ...(query.buildId && { building: { id: query.buildId } }),
            ...(query.electionLocation && { electionLocation: query.electionLocation }),
            ...(query.searchText && {
              lastName: Like(`%${query.searchText}%`),
            }),
          },
        ],
        relations: ['unitUser', 'unitUser.unit', 'building', 'documents'],
        order: { createdAt: 'DESC' },
        take,
        skip,
      })

      if (shouldFilterByUnit) {
        const filtered = data.filter((nu) => adminUnitIds.includes(nu.unitUser?.unit?.id))
        return { data: filtered, total: filtered.length }
      }

      return { data, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getByIdCardAndUnitUserIdCard(idCardNo: string, unitUserIdCard: string): Promise<NotUnitUser[]> {
    this.logger.log('get-not-unit-user-by-id-card-and-unit-user-id-card')
    try {
      return await this.notUnitUserRepository.find({
        where: {
          idCardNo,
          unitUser: { idCardNo: unitUserIdCard },
          isDeleted: false,
        },
        relations: ['unitUser', 'building', 'documents'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getNotUnitUserById(id: string): Promise<NotUnitUser> {
    this.logger.log('get-not-unit-user-by-id')
    try {
      return await this.notUnitUserRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['unitUser', 'building', 'documents'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateNotUnitUser({
    id,
    update,
    adminId,
  }: {
    id: string
    update: NotUnitUserUpdateDto
    adminId?: string
  }): Promise<NotUnitUser> {
    this.logger.log('update-not-unit-user')
    try {
      const { documents, unitUserId, buildId, ...rest } = update

      await this.notUnitUserRepository.save({
        id,
        ...rest,
        unitUser: unitUserId ? { id: unitUserId } : undefined,
        building: buildId ? { id: buildId } : undefined,
        ...(adminId && { updatedBy: { id: adminId } }),
      })

      if (documents) {
        await this.documentRepository.delete({ notUnitUser: { id } })
        if (documents.length) {
          const docEntities = documents.map((doc) =>
            this.documentRepository.create({ ...doc, notUnitUser: { id } }),
          )
          await this.documentRepository.save(docEntities)
        }
      }

      return this.getNotUnitUserById(id)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteNotUnitUser(id: string, adminId?: string): Promise<boolean> {
    this.logger.log('delete-not-unit-user')
    try {
      await this.notUnitUserRepository.update(id, {
        isDeleted: true,
        ...(adminId && { updatedBy: { id: adminId } }),
      })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
