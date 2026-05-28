import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { UnitUserVehicleDocument } from './entities/unit-user-vehicle-document.entity'
import {
  UnitUserVehicleDocumentCreateDto,
  UnitUserVehicleDocumentQueryDto,
  UnitUserVehicleDocumentUpdateDto,
} from './dto/unit-user-vehicle-document.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class UnitUserVehicleDocumentService {
  private readonly logger = new Logger(UnitUserVehicleDocumentService.name)
  constructor(
    @InjectRepository(UnitUserVehicleDocument)
    private readonly repo: Repository<UnitUserVehicleDocument>,
  ) {}

  async create(dto: UnitUserVehicleDocumentCreateDto): Promise<UnitUserVehicleDocument> {
    this.logger.log('create-unit-user-vehicle-document')
    try {
      const entity = this.repo.create({
        ...dto,
        vehicle: dto.vehicleId ? { id: dto.vehicleId } : undefined,
      })
      return await this.repo.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAll(
    query: UnitUserVehicleDocumentQueryDto,
  ): Promise<{ data: UnitUserVehicleDocument[]; total: number }> {
    this.logger.log('get-all-unit-user-vehicle-documents')
    try {
      const { take, skip } = paginationUtil(query)
      const [data, total] = await this.repo.findAndCount({
        where: {
          isDeleted: false,
          ...(query.vehicleId && { vehicle: { id: query.vehicleId } }),
          ...(query.searchText && { docName: Like(`%${query.searchText}%`) }),
        },
        relations: ['vehicle'],
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

  async getById(id: string): Promise<UnitUserVehicleDocument> {
    this.logger.log('get-unit-user-vehicle-document-by-id')
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
    update: UnitUserVehicleDocumentUpdateDto
  }): Promise<UnitUserVehicleDocument> {
    this.logger.log('update-unit-user-vehicle-document')
    try {
      return await this.repo.save({
        id,
        ...update,
        vehicle: update.vehicleId
          ? { id: update.vehicleId }
          : undefined,
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log('delete-unit-user-vehicle-document')
    try {
      await this.repo.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
