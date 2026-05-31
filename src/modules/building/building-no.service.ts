import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { BuildingNo } from './entities/building-no.entity'
import { BuildingNoCreateDto, BuildingNoQueryDto, BuildingNoUpdateDto } from './dto/building-no.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class BuildingNoService {
  private readonly logger = new Logger(BuildingNoService.name)
  constructor(
    @InjectRepository(BuildingNo)
    private readonly buildingNoRepository: Repository<BuildingNo>,
  ) {}

  async createBuildingNo(dto: BuildingNoCreateDto): Promise<BuildingNo> {
    this.logger.log('create-building-no')
    try {
      const entity = this.buildingNoRepository.create(dto)
      return await this.buildingNoRepository.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAllBuildingNos(query: BuildingNoQueryDto): Promise<{ data: BuildingNo[]; total: number }> {
    this.logger.log('get-all-building-nos')
    try {
      const { take, skip } = paginationUtil(query)

      const [data, total] = await this.buildingNoRepository.findAndCount({
        where: {
          isDeleted: false,
          ...(query.searchText && { buildNo: Like(`%${query.searchText}%`) }),
        },
        relations: ['buildings'],
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

  async getBuildingNoById(id: string): Promise<BuildingNo> {
    this.logger.log('get-building-no-by-id')
    try {
      return await this.buildingNoRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['buildings'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateBuildingNo({
    id,
    update,
  }: {
    id: string
    update: BuildingNoUpdateDto
  }): Promise<BuildingNo> {
    this.logger.log('update-building-no')
    try {
      return await this.buildingNoRepository.save({ id, ...update })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteBuildingNo(id: string): Promise<boolean> {
    this.logger.log('delete-building-no')
    try {
      await this.buildingNoRepository.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
