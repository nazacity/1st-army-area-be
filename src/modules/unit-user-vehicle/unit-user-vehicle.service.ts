import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { UnitUserVehicle } from './entities/unit-user-vehicle.entity'
import { UnitUserVehicleImage } from '../unit-user-vehicle-image/entities/unit-user-vehicle-image.entity'
import { VehicleCreateDto, VehicleQueryDto, VehicleUpdateDto } from './dto/unit-user-vehicle.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class UnitUserVehicleService {
  private readonly logger = new Logger(UnitUserVehicleService.name)
  constructor(
    @InjectRepository(UnitUserVehicle)
    private readonly repo: Repository<UnitUserVehicle>,
    @InjectRepository(UnitUserVehicleImage)
    private readonly imageRepo: Repository<UnitUserVehicleImage>,
  ) {}

  async create(dto: VehicleCreateDto): Promise<UnitUserVehicle> {
    this.logger.log('create-vehicle')
    try {
      const { images, ...rest } = dto

      if (dto.licensePlate) {
        const existing = await this.repo.findOne({
          where: { licensePlate: dto.licensePlate, isDeleted: false },
        })
        if (existing) {
          throw new ConflictException(`Vehicle with license plate "${dto.licensePlate}" already exists`)
        }
      }

      const entity = this.repo.create({
        ...rest,
        relationUnitUser: dto.unitUserId ? { id: dto.unitUserId } : undefined,
        stickers: dto.stickerId ? [{ id: dto.stickerId }] : undefined,
      })
      const saved = await this.repo.save(entity)

      if (images?.length) {
        const imageEntities = images.map((img) =>
          this.imageRepo.create({ ...img, vehicle: { id: saved.id } }),
        )
        await this.imageRepo.save(imageEntities)
      }

      return this.getById(saved.id)
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
            ...(query.status && { status: query.status }),
            ...(query.unitUserId && {
              relationUnitUser: { id: query.unitUserId },
            }),
            ...(query.searchText && {
              licensePlate: Like(`%${query.searchText}%`),
            }),
          },
          {
            isDeleted: false,
            ...(query.status && { status: query.status }),
            ...(query.unitUserId && {
              relationUnitUser: { id: query.unitUserId },
            }),
            ...(query.searchText && {
              ownerFullName: Like(`%${query.searchText}%`),
            }),
          },
        ],
        relations: ['images', 'relationUnitUser', 'stickers'],
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

  async getByLicensePlateAndIdCard(licensePlate: string, idCardNo: string): Promise<UnitUserVehicle[]> {
    this.logger.log('get-vehicle-by-license-plate-and-id-card')
    try {
      return await this.repo.find({
        where: [
          { licensePlate, relationUnitUser: { idCardNo }, isDeleted: false },
          { licensePlate, relationUnitUser: { soliderIdCardNo: idCardNo }, isDeleted: false },
        ],
        relations: ['images', 'relationUnitUser', 'stickers'],
      })
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
        relations: ['images', 'relationUnitUser', 'stickers'],
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
      const { images, ...rest } = update

      await this.repo.save({
        id,
        ...rest,
        relationUnitUser: update.unitUserId
          ? { id: update.unitUserId }
          : undefined,
        stickers: update.stickerId ? [{ id: update.stickerId }] : undefined,
      })

      if (images) {
        await this.imageRepo.delete({ vehicle: { id } })
        if (images.length) {
          const imageEntities = images.map((img) =>
            this.imageRepo.create({ ...img, vehicle: { id } }),
          )
          await this.imageRepo.save(imageEntities)
        }
      }

      return this.getById(id)
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
