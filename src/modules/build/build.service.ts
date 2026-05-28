import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { Build } from './entities/build.entity'
import { BuildCreateDto, BuildQueryDto, BuildUpdateDto } from './dto/build.dto'
import { paginationUtil } from 'src/utils/pagination'
import { Unit } from 'src/modules/unit/entities/unit.entity'

@Injectable()
export class BuildService {
  private readonly logger = new Logger(BuildService.name)
  constructor(
    @InjectRepository(Build)
    private readonly buildRepository: Repository<Build>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async createBuild(dto: BuildCreateDto): Promise<Build> {
    this.logger.log('create-build')
    try {
      const { unitId, ...rest } = dto
      const duplicate = await this.buildRepository.existsBy({
        buildNo: rest.buildNo,
        floor: rest.floor,
        no: rest.no,
        isDeleted: false,
      })
      if (duplicate) {
        throw new Error('build with same buildNo, floor, and no already exists')
      }
      const entity = this.buildRepository.create(rest)
      if (unitId) {
        entity.unit = await this.unitRepository.findOneBy({ id: unitId })
      }
      return await this.buildRepository.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAllBuilds(
    query: BuildQueryDto,
  ): Promise<{ data: Build[]; total: number }> {
    this.logger.log('get-all-builds')
    try {
      const { take, skip } = paginationUtil(query)

      const [data, total] = await this.buildRepository.findAndCount({
        where: {
          isDeleted: false,
          ...(query.status && { status: query.status }),
          ...(query.type && { type: query.type }),
          ...(query.searchText && { buildNo: Like(`%${query.searchText}%`) }),
          ...(query.unitId && { unit: { id: query.unitId } }),
        },
        relations: ['relationNotUnitUser', 'unitUser', 'unit'],
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

  async getBuildById(id: string): Promise<Build> {
    this.logger.log('get-build-by-id')
    try {
      return await this.buildRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['relationNotUnitUser', 'unitUser', 'unit'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateBuild({
    id,
    update,
  }: {
    id: string
    update: BuildUpdateDto
  }): Promise<Build> {
    this.logger.log('update-build')
    try {
      const { unitId, ...rest } = update
      const entity: any = { id, ...rest }
      if (unitId) {
        entity.unit = await this.unitRepository.findOneBy({ id: unitId })
      }
      return await this.buildRepository.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteBuild(id: string): Promise<boolean> {
    this.logger.log('delete-build')
    try {
      await this.buildRepository.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
