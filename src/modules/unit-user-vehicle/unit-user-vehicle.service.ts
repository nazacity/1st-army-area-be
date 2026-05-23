import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { UnitUserVehicle } from './entities/unit-user-vehicle.entity'
import { VehicleCreateDto, VehicleQueryDto, VehicleUpdateDto } from './dto/unit-user-vehicle.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class UnitUserVehicleService {
  private readonly logger = new Logger(UnitUserVehicleService.name)
  constructor(
    @InjectRepository(UnitUserVehicle)
    private readonly repo: Repository<UnitUserVehicle>,
  ) {}

  async create(dto: VehicleCreateDto): Promise<UnitUserVehicle> {
    this.logger.log('create-vehicle')
    try {
      const entity = this.repo.create({
        ...dto,
        relationUnitUser: dto.unitUserId ? { id: dto.unitUserId } : undefined,
        sticker: dto.stickerId ? { id: dto.stickerId } : undefined,
      })
      return await this.repo.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAll(
    query: VehicleQueryDto,
  ): Promise<{ data: UnitUserVehicle[]; total: number }> {
    this.logger.log('get-all-vehicles')
    try {
      const { take, skip } = paginationUtil(query)
      const [data, total] = await this.repo.findAndCount({
        where: [
          {
            isDeleted: false,
            ...(query.unitUserId && {
              relationUnitUser: { id: query.unitUserId },
            }),
            ...(query.searchText && {
              licensePlate: Like(`%${query.searchText}%`),
            }),
          },
          {
            isDeleted: false,
            ...(query.unitUserId && {
              relationUnitUser: { id: query.unitUserId },
            }),
            ...(query.searchText && {
              ownerFullName: Like(`%${query.searchText}%`),
            }),
          },
        ],
        relations: ['images', 'relationUnitUser', 'sticker'],
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

  async getById(id: string): Promise<UnitUserVehicle> {
    this.logger.log('get-vehicle-by-id')
    try {
      return await this.repo.findOne({
        where: { id, isDeleted: false },
        relations: ['images', 'relationUnitUser', 'sticker'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async update({
    id,
    update,
  }: {
    id: string
    update: VehicleUpdateDto
  }): Promise<UnitUserVehicle> {
    this.logger.log('update-vehicle')
    try {
      return await this.repo.save({
        id,
        ...update,
        relationUnitUser: update.unitUserId
          ? { id: update.unitUserId }
          : undefined,
        sticker: update.stickerId ? { id: update.stickerId } : undefined,
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log('delete-vehicle')
    try {
      await this.repo.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
