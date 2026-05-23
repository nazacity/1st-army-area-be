import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UnitUserVehicleImage } from './entities/unit-user-vehicle-image.entity'
import {
  UnitUserVehicleImageCreateDto,
  UnitUserVehicleImageUpdateDto,
} from './dto/unit-user-vehicle-image.dto'

@Injectable()
export class UnitUserVehicleImageService {
  private readonly logger = new Logger(UnitUserVehicleImageService.name)
  constructor(
    @InjectRepository(UnitUserVehicleImage)
    private readonly repo: Repository<UnitUserVehicleImage>,
  ) {}

  async create(dto: UnitUserVehicleImageCreateDto): Promise<UnitUserVehicleImage> {
    this.logger.log('create-vehicle-image')
    try {
      const entity = this.repo.create({
        imageUrl: dto.imageUrl,
        vehicle: dto.vehicleId ? { id: dto.vehicleId } : undefined,
      })
      return await this.repo.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getById(id: string): Promise<UnitUserVehicleImage> {
    this.logger.log('get-vehicle-image-by-id')
    try {
      return await this.repo.findOne({ where: { id, isDeleted: false } })
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
    update: UnitUserVehicleImageUpdateDto
  }): Promise<UnitUserVehicleImage> {
    this.logger.log('update-vehicle-image')
    try {
      return await this.repo.save({ id, ...update })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log('delete-vehicle-image')
    try {
      await this.repo.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
