import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { NotUnitUser } from './entities/not-unit-user.entity'
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
  ) {}

  async createNotUnitUser(dto: NotUnitUserCreateDto): Promise<NotUnitUser> {
    this.logger.log('create-not-unit-user')
    try {
      const entity = await this.notUnitUserRepository.create({
        ...dto,
        unitUser: dto.unitUserId ? { id: dto.unitUserId } : undefined,
        build: dto.buildId ? { id: dto.buildId } : undefined,
      })
      return await this.notUnitUserRepository.save(entity)
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
            ...(query.buildId && { build: { id: query.buildId } }),
            ...(query.searchText && {
              firstName: Like(`%${query.searchText}%`),
            }),
          },
          {
            isDeleted: false,
            ...(query.status && { status: query.status }),
            ...(query.unitUserId && { unitUser: { id: query.unitUserId } }),
            ...(query.buildId && { build: { id: query.buildId } }),
            ...(query.searchText && {
              lastName: Like(`%${query.searchText}%`),
            }),
          },
        ],
        relations: ['unitUser', 'build'],
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

  async getNotUnitUserById(id: string): Promise<NotUnitUser> {
    this.logger.log('get-not-unit-user-by-id')
    try {
      return await this.notUnitUserRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['unitUser', 'build'],
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
      return await this.notUnitUserRepository.save({
        id,
        ...update,
        unitUser: update.unitUserId ? { id: update.unitUserId } : undefined,
        build: update.buildId ? { id: update.buildId } : undefined,
      })
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
