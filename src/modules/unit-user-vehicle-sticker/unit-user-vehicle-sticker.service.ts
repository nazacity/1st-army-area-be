import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UnitUserVehicleSticker } from './entities/unit-user-vehicle-sticker.entity'
import {
  VehicleStickerCreateDto,
  VehicleStickerUpdateDto,
} from './dto/unit-user-vehicle-sticker.dto'

@Injectable()
export class UnitUserVehicleStickerService {
  private readonly logger = new Logger(UnitUserVehicleStickerService.name)
  constructor(
    @InjectRepository(UnitUserVehicleSticker)
    private readonly repo: Repository<UnitUserVehicleSticker>,
  ) {}

  async create(dto: VehicleStickerCreateDto): Promise<UnitUserVehicleSticker> {
    this.logger.log('create-vehicle-sticker')
    try {
      const entity = this.repo.create(dto)
      return await this.repo.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getById(id: string): Promise<UnitUserVehicleSticker> {
    this.logger.log('get-vehicle-sticker-by-id')
    try {
      return await this.repo.findOne({
        where: { id, isDeleted: false },
        relations: ['vehicle'],
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
    update: VehicleStickerUpdateDto
  }): Promise<UnitUserVehicleSticker> {
    this.logger.log('update-vehicle-sticker')
    try {
      return await this.repo.save({ id, ...update })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log('delete-vehicle-sticker')
    try {
      await this.repo.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
