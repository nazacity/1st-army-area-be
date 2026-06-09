import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, ILike, Repository } from 'typeorm'
import { Building, BuildingType } from './entities/building.entity'
import { BuildingNo } from './entities/building-no.entity'
import {
  BuildingCreateDto,
  BuildingQueryDto,
  BuildingQueryByPublicDto,
  BuildingUpdateDto,
  AutoCreateBuildingDto,
} from './dto/building.dto'
import { paginationUtil } from 'src/utils/pagination'
import { Unit } from 'src/modules/unit/entities/unit.entity'

@Injectable()
export class BuildingService {
  private readonly logger = new Logger(BuildingService.name)
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(BuildingNo)
    private readonly buildingNoRepository: Repository<BuildingNo>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async createBuilding(dto: BuildingCreateDto): Promise<Building> {
    this.logger.log('create-building')
    try {
      const { unitId, buildingNoId, ...rest } = dto
      const entity = this.buildingRepository.create(rest)
      if (buildingNoId) {
        entity.buildingNo = await this.buildingNoRepository.findOneBy({
          id: buildingNoId,
        })
      }
      if (unitId) {
        entity.unit = await this.unitRepository.findOneBy({ id: unitId })
      }
      return await this.buildingRepository.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAllBuildings(
    query: BuildingQueryDto,
  ): Promise<{ data: Building[]; total: number }> {
    this.logger.log('get-all-buildings')
    try {
      const { take, skip } = paginationUtil(query)

      const [data, total] = await this.buildingRepository.findAndCount({
        where: {
          isDeleted: false,
          ...(query.status && { status: query.status }),
          ...(query.type && { type: query.type }),
          ...(query.searchText && {
            buildingNo: {
              ...(query.buildingNoId && { id: query.buildingNoId }),
              buildNo: Like(`%${query.searchText}%`),
            },
          }),
          ...(!query.searchText &&
            query.buildingNoId && { buildingNo: { id: query.buildingNoId } }),
          ...(query.unitId && { unit: { id: query.unitId } }),
        },
        relations: ['buildingNo', 'relationNotUnitUser', 'unitUser', 'unit'],
        order: { floor: 'ASC', no: 'ASC' },
        take,
        skip,
      })

      return { data, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAllBuildingsByPublic(
    query: BuildingQueryByPublicDto,
  ): Promise<{ data: Building[]; total: number }> {
    this.logger.log('get-all-buildings-by-public')
    try {
      const conditions = []

      if (query.buildingNoId) {
        conditions.push({
          isDeleted: false,
          unitUser: { id: null },
          buildingNo: { id: query.buildingNoId },
        })
      }

      if (query.searchText) {
        conditions.push({
          isDeleted: false,
          unitUser: { id: null },
          buildingNo: { buildNo: ILike(`%${query.searchText}%`) },
        })
      }

      const [data, total] = await this.buildingRepository.findAndCount({
        where: conditions,
        relations: ['buildingNo', 'relationNotUnitUser', 'unitUser', 'unit'],
        order: { floor: 'ASC', no: 'ASC' },
      })

      return { data, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getBuildingById(id: string): Promise<Building> {
    this.logger.log('get-building-by-id')
    try {
      return await this.buildingRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['buildingNo', 'relationNotUnitUser', 'unitUser', 'unit'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateBuilding({
    id,
    update,
  }: {
    id: string
    update: BuildingUpdateDto
  }): Promise<Building> {
    this.logger.log('update-building')
    try {
      const { unitId, buildingNoId, ...rest } = update
      const entity: any = { id, ...rest }
      if (buildingNoId) {
        entity.buildingNo = await this.buildingNoRepository.findOneBy({
          id: buildingNoId,
        })
      }
      if (unitId) {
        entity.unit = await this.unitRepository.findOneBy({ id: unitId })
      }
      return await this.buildingRepository.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteBuilding(id: string): Promise<boolean> {
    this.logger.log('delete-building')
    try {
      await this.buildingRepository.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async autoCreateBuildings(dto: AutoCreateBuildingDto): Promise<{
    buildingNo: BuildingNo
    buildings: Building[]
    skipped: number
  }> {
    this.logger.log('auto-create-buildings')
    try {
      const { buildNo, floorCount, roomCount, type, unitId } = dto

      let savedBuildingNo = await this.buildingNoRepository.findOne({
        where: { buildNo, isDeleted: false },
      })
      if (!savedBuildingNo) {
        const buildingNoEntity = this.buildingNoRepository.create({ buildNo })
        savedBuildingNo = await this.buildingNoRepository.save(buildingNoEntity)
      }

      let skipped = 0
      const buildings: Building[] = []
      for (let floor = 1; floor <= floorCount; floor++) {
        for (let no = 1; no <= roomCount; no++) {
          const exists = await this.buildingRepository.existsBy({
            buildingNo: { id: savedBuildingNo.id },
            floor,
            no,
            isDeleted: false,
          })
          if (exists) {
            skipped++
            continue
          }

          const entity = this.buildingRepository.create({
            type: type || BuildingType['เรือนแถว'],
            floor,
            no,
            buildingNo: savedBuildingNo,
          })
          if (unitId) {
            entity.unit = await this.unitRepository.findOneBy({ id: unitId })
          }
          buildings.push(entity)
        }
      }

      const savedBuildings =
        buildings.length > 0
          ? await this.buildingRepository.save(buildings)
          : []

      return { buildingNo: savedBuildingNo, buildings: savedBuildings, skipped }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
