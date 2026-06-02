import { Injectable, Logger } from '@nestjs/common'
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

  async createNotUnitUser(dto: NotUnitUserCreateDto): Promise<NotUnitUser> {
    this.logger.log('create-not-unit-user')
    try {
      const { documents, unitUserId, buildId, ...rest } = dto

      if (rest.idCardNo) {
        const existing = await this.notUnitUserRepository.findOne({
          where: { idCardNo: rest.idCardNo },
        })
        if (existing) {
          const { documents: docs, unitUserId: uid, buildId: bid, ...updateRest } = dto
          await this.notUnitUserRepository.save({
            id: existing.id,
            ...updateRest,
            isDeleted: false,
            unitUser: uid ? { id: uid } : undefined,
            building: bid ? { id: bid } : undefined,
          })
          if (docs?.length) {
            await this.documentRepository.delete({ notUnitUser: { id: existing.id } })
            const docEntities = docs.map((doc) =>
              this.documentRepository.create({ ...doc, notUnitUser: { id: existing.id } }),
            )
            await this.documentRepository.save(docEntities)
          }
          return this.getNotUnitUserById(existing.id)
        }
      }

      const entity = this.notUnitUserRepository.create({
        ...rest,
        unitUser: unitUserId ? { id: unitUserId } : undefined,
        building: buildId ? { id: buildId } : undefined,
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
  ): Promise<{ data: NotUnitUser[]; total: number }> {
    this.logger.log('get-all-not-unit-users')
    try {
      const { take, skip } = paginationUtil(query)

      const [data, total] = await this.notUnitUserRepository.findAndCount({
        where: [
          {
            isDeleted: false,
            ...(query.status && { status: query.status }),
            ...(query.unitUserId && { unitUser: { id: query.unitUserId } }),
            ...(query.buildId && { building: { id: query.buildId } }),
            ...(query.searchText && {
              firstName: Like(`%${query.searchText}%`),
            }),
          },
          {
            isDeleted: false,
            ...(query.status && { status: query.status }),
            ...(query.unitUserId && { unitUser: { id: query.unitUserId } }),
            ...(query.buildId && { building: { id: query.buildId } }),
            ...(query.searchText && {
              lastName: Like(`%${query.searchText}%`),
            }),
          },
        ],
        relations: ['unitUser', 'building', 'documents'],
        order: { createdAt: 'DESC' },
        take,
        skip,
      })

      return { data, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getNotUnitUserByIdCard(idCardNo: string): Promise<NotUnitUser> {
    this.logger.log('get-not-unit-user-by-id-card')
    try {
      return await this.notUnitUserRepository.findOne({
        where: { idCardNo, isDeleted: false },
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
  }: {
    id: string
    update: NotUnitUserUpdateDto
  }): Promise<NotUnitUser> {
    this.logger.log('update-not-unit-user')
    try {
      const { documents, unitUserId, buildId, ...rest } = update

      await this.notUnitUserRepository.save({
        id,
        ...rest,
        unitUser: unitUserId ? { id: unitUserId } : undefined,
        building: buildId ? { id: buildId } : undefined,
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

  async deleteNotUnitUser(id: string): Promise<boolean> {
    this.logger.log('delete-not-unit-user')
    try {
      await this.notUnitUserRepository.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
