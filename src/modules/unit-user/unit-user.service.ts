import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { UnitUser } from './entities/unit-user.entity'
import {
  UnitUserCreateDto,
  UnitUserQueryDto,
  UnitUserUpdateDto,
} from './dto/unit-user.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class UnitUserService {
  private readonly logger = new Logger(UnitUserService.name)
  constructor(
    @InjectRepository(UnitUser)
    private readonly unitUserRepository: Repository<UnitUser>,
  ) {}

  async createUnitUser(dto: UnitUserCreateDto): Promise<UnitUser> {
    this.logger.log('create-unit-user')
    try {
      const entity = this.unitUserRepository.create({
        ...dto,
        build: dto.buildId ? { id: dto.buildId } : undefined,
        unit: dto.unitId ? { id: dto.unitId } : undefined,
      })
      return await this.unitUserRepository.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAllUnitUsers(
    query: UnitUserQueryDto,
  ): Promise<{ data: UnitUser[]; total: number }> {
    this.logger.log('get-all-unit-users')
    try {
      const { take, skip } = paginationUtil(query)

      const [data, total] = await this.unitUserRepository.findAndCount({
        where: [
          {
            isDeleted: false,
            ...(query.status && { status: query.status }),
            ...(query.buildId && { build: { id: query.buildId } }),
            ...(query.unitId && { unit: { id: query.unitId } }),
            ...(query.searchText && {
              firstName: Like(`%${query.searchText}%`),
            }),
          },
          {
            isDeleted: false,
            ...(query.status && { status: query.status }),
            ...(query.buildId && { build: { id: query.buildId } }),
            ...(query.unitId && { unit: { id: query.unitId } }),
            ...(query.searchText && {
              lastName: Like(`%${query.searchText}%`),
            }),
          },
        ],
        relations: ['build', 'unit', 'relationNotUnitUser'],
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

  async getUnitUserById(id: string): Promise<UnitUser> {
    this.logger.log('get-unit-user-by-id')
    try {
      return await this.unitUserRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['build', 'unit', 'relationNotUnitUser'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateUnitUser({
    id,
    update,
  }: {
    id: string
    update: UnitUserUpdateDto
  }): Promise<UnitUser> {
    this.logger.log('update-unit-user')
    try {
      return await this.unitUserRepository.save({
        id,
        ...update,
        build: update.buildId ? { id: update.buildId } : undefined,
        unit: update.unitId ? { id: update.unitId } : undefined,
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteUnitUser(id: string): Promise<boolean> {
    this.logger.log('delete-unit-user')
    try {
      await this.unitUserRepository.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
