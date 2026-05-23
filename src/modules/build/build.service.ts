import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { Build } from './entities/build.entity'
import { BuildCreateDto, BuildQueryDto, BuildUpdateDto } from './dto/build.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class BuildService {
  private readonly logger = new Logger(BuildService.name)
  constructor(
    @InjectRepository(Build)
    private readonly buildRepository: Repository<Build>,
  ) {}

  async createBuild(dto: BuildCreateDto): Promise<Build> {
    this.logger.log('create-build')
    try {
      const entity = this.buildRepository.create(dto)
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
          ...(query.searchText && { buildNo: Like(`%${query.searchText}%`) }),
        },
        relations: ['relationNotUnitUser'],
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
        relations: ['relationNotUnitUser'],
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
      return await this.buildRepository.save({ id, ...update })
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
