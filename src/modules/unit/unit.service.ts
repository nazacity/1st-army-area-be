import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Like, Repository } from 'typeorm'
import { Unit } from './entities/unit.entity'
import { UnitCreateDto, UnitQueryDto, UnitUpdateDto } from './dto/unit.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class UnitService {
  private readonly logger = new Logger(UnitService.name)
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async createUnit(dto: UnitCreateDto, adminId?: string): Promise<Unit> {
    this.logger.log('create-unit')
    try {
      const entity = this.unitRepository.create({
        ...dto,
        ...(adminId && { createdBy: { id: adminId }, updatedBy: { id: adminId } }),
      })
      return await this.unitRepository.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAllUnits(
    query: UnitQueryDto,
    adminUnitIds: string[] = [],
  ): Promise<{ data: Unit[]; total: number }> {
    this.logger.log('get-all-units')
    try {
      const { take, skip } = paginationUtil(query)
      const [data, total] = await this.unitRepository.findAndCount({
        where: {
          isDeleted: false,
          ...(query.searchText && { name: Like(`%${query.searchText}%`) }),
          ...(adminUnitIds.length > 0 && { id: In(adminUnitIds) }),
        },
        relations: ['unitUsers'],
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

  async getUnitById(id: string): Promise<Unit> {
    this.logger.log('get-unit-by-id')
    try {
      return await this.unitRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['unitUsers'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateUnit({
    id,
    update,
    adminId,
  }: {
    id: string
    update: UnitUpdateDto
    adminId?: string
  }): Promise<Unit> {
    this.logger.log('update-unit')
    try {
      return await this.unitRepository.save({
        id,
        ...update,
        ...(adminId && { updatedBy: { id: adminId } }),
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteUnit(id: string, adminId?: string): Promise<boolean> {
    this.logger.log('delete-unit')
    try {
      await this.unitRepository.update(id, {
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
