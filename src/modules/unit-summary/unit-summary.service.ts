import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { UnitUser } from '../unit-user/entities/unit-user.entity'
import { NotUnitUser } from '../not-unit-user/entities/not-unit-user.entity'
import { UnitUserVehicle } from '../unit-user-vehicle/entities/unit-user-vehicle.entity'
import { Building } from '../building/entities/building.entity'
import { paginationUtil } from 'src/utils/pagination'
import {
  BuildingSummaryQueryDto,
  ElectionLocation,
  NotUnitUserSummaryQueryDto,
  UnitUserSummaryQueryDto,
  VehicleSummaryQueryDto,
} from './dto/unit-summary.dto'

@Injectable()
export class UnitSummaryService {
  private readonly logger = new Logger(UnitSummaryService.name)

  constructor(
    @InjectRepository(UnitUser)
    private readonly unitUserRepo: Repository<UnitUser>,
    @InjectRepository(NotUnitUser)
    private readonly notUnitUserRepo: Repository<NotUnitUser>,
    @InjectRepository(UnitUserVehicle)
    private readonly vehicleRepo: Repository<UnitUserVehicle>,
    @InjectRepository(Building)
    private readonly buildingRepo: Repository<Building>,
  ) {}

  async getUnitUsers(query: UnitUserSummaryQueryDto) {
    this.logger.log('get-unit-users-summary')
    const { take, skip } = paginationUtil(query)

    const baseWhere = {
      isDeleted: false,
      ...(query.status && { status: query.status }),
      ...(query.rank && { rank: query.rank }),
      ...(query.unitId && { unit: { id: query.unitId } }),
    }

    const searchFields = query.searchText
      ? [
          { ...baseWhere, firstName: Like(`%${query.searchText}%`) },
          { ...baseWhere, lastName: Like(`%${query.searchText}%`) },
          { ...baseWhere, idCardNo: Like(`%${query.searchText}%`) },
          { ...baseWhere, soliderIdCardNo: Like(`%${query.searchText}%`) },
        ]
      : [baseWhere]

    const [data, total] = await this.unitUserRepo.findAndCount({
      where: searchFields,
      relations: ['building.buildingNo', 'unit', 'relationNotUnitUser'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    })

    return { meta: { total }, data }
  }

  async getNotUnitUsers(query: NotUnitUserSummaryQueryDto) {
    this.logger.log('get-not-unit-users-summary')
    const { take, skip } = paginationUtil(query)

    const baseWhere = {
      isDeleted: false,
      ...(query.status && { status: query.status }),
      ...(query.unitId && { unitUser: { unit: { id: query.unitId } } }),
    }

    const searchFields = query.searchText
      ? [
          { ...baseWhere, firstName: Like(`%${query.searchText}%`) },
          { ...baseWhere, lastName: Like(`%${query.searchText}%`) },
        ]
      : [baseWhere]

    const [data, total] = await this.notUnitUserRepo.findAndCount({
      where: searchFields,
      relations: ['unitUser', 'unitUser.unit', 'building', 'documents'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    })

    return { meta: { total }, data }
  }

  async getVehicles(query: VehicleSummaryQueryDto) {
    this.logger.log('get-vehicles-summary')
    const { take, skip } = paginationUtil(query)

    const baseWhere = {
      isDeleted: false,
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.unitId && { relationUnitUser: { unit: { id: query.unitId } } }),
    }

    const searchFields = query.searchText
      ? [
          { ...baseWhere, licensePlate: Like(`%${query.searchText}%`) },
          { ...baseWhere, ownerFullName: Like(`%${query.searchText}%`) },
        ]
      : [baseWhere]

    const [data, total] = await this.vehicleRepo.findAndCount({
      where: searchFields,
      relations: ['images', 'relationUnitUser', 'relationUnitUser.unit', 'stickers'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    })

    return { meta: { total }, data }
  }

  async getBuildings(query: BuildingSummaryQueryDto) {
    this.logger.log('get-buildings-summary')
    const { take, skip } = paginationUtil(query)

    const where = {
      isDeleted: false,
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.buildingNoId && { buildingNo: { id: query.buildingNoId } }),
      ...(query.unitId && { unit: { id: query.unitId } }),
    }

    const [data, total] = await this.buildingRepo.findAndCount({
      where,
      relations: ['buildingNo', 'unit', 'unitUser'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    })

    return { meta: { total }, data }
  }

  async getUnitUserElectionLocationSummary() {
    this.logger.log('get-unit-user-election-location-summary')
    const knownLocations = [ElectionLocation.พื้นที่สนามเป้า, ElectionLocation.พื้นที่สระบุรี]

    const counts = await Promise.all(
      knownLocations.map(async (location) => {
        const count = await this.unitUserRepo.count({
          where: { isDeleted: false, electionLocation: location },
        })
        return { electionLocation: location, count }
      }),
    )

    const otherCount = await this.unitUserRepo
      .createQueryBuilder('u')
      .where('u.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('u.electionLocation NOT IN (:...locations)', { locations: knownLocations })
      .getCount()

    const total = counts.reduce((sum, c) => sum + c.count, 0) + otherCount

    return { data: { summary: [...counts, { electionLocation: 'อื่นๆ', count: otherCount }], total } }
  }

  async getNotUnitUserElectionLocationSummary() {
    this.logger.log('get-not-unit-user-election-location-summary')
    const knownLocations = [ElectionLocation.พื้นที่สนามเป้า, ElectionLocation.พื้นที่สระบุรี]

    const counts = await Promise.all(
      knownLocations.map(async (location) => {
        const count = await this.notUnitUserRepo.count({
          where: { isDeleted: false, electionLocation: location },
        })
        return { electionLocation: location, count }
      }),
    )

    const otherCount = await this.notUnitUserRepo
      .createQueryBuilder('nu')
      .where('nu.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('nu.electionLocation NOT IN (:...locations)', { locations: knownLocations })
      .getCount()

    const total = counts.reduce((sum, c) => sum + c.count, 0) + otherCount

    return { data: { summary: [...counts, { electionLocation: 'อื่นๆ', count: otherCount }], total } }
  }
}
