import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Like, Repository } from 'typeorm'
import { UnitUser } from './entities/unit-user.entity'
import {
  IDCardUnitUserQueryDto,
  UnitUserCreateDto,
  UnitUserQueryDto,
  UnitUserUpdateDto,
} from './dto/unit-user.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class UnitUserService {
  private readonly logger = new Logger(UnitUserService.name)
  constructor(
    @InjectRepository(UnitUser)
    private readonly unitUserRepository: Repository<UnitUser>,
  ) {}

  async createUnitUser(dto: UnitUserCreateDto): Promise<UnitUser> {
    this.logger.log('create-unit-user')
    try {
      if (dto.idCardNo || dto.soliderIdCardNo) {
        const existing = await this.unitUserRepository
          .createQueryBuilder('u')
          .where('u.isDeleted = false')
          .andWhere(
            new Brackets((qb) => {
              if (dto.idCardNo) qb.orWhere('u.idCardNo = :idCardNo', { idCardNo: dto.idCardNo })
              if (dto.soliderIdCardNo) qb.orWhere('u.soliderIdCardNo = :soliderIdCardNo', { soliderIdCardNo: dto.soliderIdCardNo })
            }),
          )
          .getOne()

        if (existing) {
          throw new Error('ข้อมูลบัตรประชาชนหรือเลขที่หมายเลขทหารมีอยู่ในระบบแล้ว')
        }
      }

      const entity = this.unitUserRepository.create({
        ...dto,
        building: dto.buildId ? { id: dto.buildId } : null,
        unit: dto.unitId ? { id: dto.unitId } : undefined,
      })
      return await this.unitUserRepository.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAllUnitUsers(
    query: UnitUserQueryDto,
  ): Promise<{ data: UnitUser[]; total: number }> {
    this.logger.log('get-all-unit-users')
    try {
      const { take, skip } = paginationUtil(query)

      const baseWhere = {
        isDeleted: false,
        ...(query.status && { status: query.status }),
        ...(query.rank && { rank: query.rank }),
        ...(query.buildId && { building: { id: query.buildId } }),
        ...(query.unitId && { unit: { id: query.unitId } }),
        ...(query.electionLocation && query.electionLocation !== 'อื่นๆ' && { electionLocation: query.electionLocation }),
      }

      const searchFields = query.searchText
        ? [
            { ...baseWhere, firstName: Like(`%${query.searchText}%`) },
            { ...baseWhere, lastName: Like(`%${query.searchText}%`) },
            { ...baseWhere, idCardNo: Like(`%${query.searchText}%`) },
            { ...baseWhere, soliderIdCardNo: Like(`%${query.searchText}%`) },
          ]
        : [baseWhere]

      if (query.electionLocation === 'อื่นๆ') {
        const qb = this.unitUserRepository.createQueryBuilder('u')
          .leftJoinAndSelect('u.building', 'building')
          .leftJoinAndSelect('building.buildingNo', 'buildingNo')
          .leftJoinAndSelect('u.unit', 'unit')
          .leftJoinAndSelect('u.relationNotUnitUser', 'relationNotUnitUser')
          .where('u.isDeleted = :isDeleted', { isDeleted: false })
          .andWhere('u.electionLocation NOT IN (:...locations)', { locations: ['พื้นที่สนามเป้า', 'พื้นที่สระบุรี'] })

        if (query.status) qb.andWhere('u.status = :status', { status: query.status })
        if (query.rank) qb.andWhere('u.rank = :rank', { rank: query.rank })
        if (query.buildId) qb.andWhere('u.buildingId = :buildId', { buildId: query.buildId })
        if (query.unitId) qb.andWhere('u.unitId = :unitId', { unitId: query.unitId })
        if (query.searchText) qb.andWhere('(u.firstName ILIKE :search OR u.lastName ILIKE :search OR u.idCardNo ILIKE :search OR u.soliderIdCardNo ILIKE :search)', { search: `%${query.searchText}%` })

        const [data, total] = await qb.orderBy('u.createdAt', 'DESC').take(take).skip(skip).getManyAndCount()
        return { data, total }
      }

      const [data, total] = await this.unitUserRepository.findAndCount({
        where: searchFields,
        relations: ['building.buildingNo', 'unit', 'relationNotUnitUser'],
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

  async getUnitUserById(id: string): Promise<UnitUser> {
    this.logger.log('get-unit-user-by-id')
    try {
      return await this.unitUserRepository.findOne({
        where: { id, isDeleted: false },
        relations: [
          'building',
          'building.buildingNo',
          'unit',
          'relationNotUnitUser',
          'relationNotUnitUser.documents',
          'vehicles',
          'vehicles.images',
          'vehicles.stickers',
          'vehicles.documents',
          'documents',
        ],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUnitUserByIdCard(query: IDCardUnitUserQueryDto): Promise<UnitUser> {
    this.logger.log('get-unit-user-by-id-card')
    try {
      return await this.unitUserRepository.findOne({
        where: {
          idCardNo: query.idCardNo,
          soliderIdCardNo: query.soliderIdCardNo,
          isDeleted: false,
        },
        relations: ['building', 'unit', 'relationNotUnitUser'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUnitUserBySoldierNo(soliderIdCardNo: string): Promise<UnitUser> {
    this.logger.log('get-unit-user-by-soldier-no')
    try {
      return await this.unitUserRepository.findOne({
        where: { soliderIdCardNo, isDeleted: false },
        relations: ['building', 'building.buildingNo', 'unit', 'relationNotUnitUser'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUnitUserByIdCardNo(idCardNo: string): Promise<UnitUser> {
    this.logger.log('get-unit-user-by-id-card-no')
    try {
      return await this.unitUserRepository.findOne({
        where: { idCardNo, isDeleted: false },
        relations: ['building', 'building.buildingNo', 'unit', 'relationNotUnitUser'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateUnitUser({
    id,
    update,
  }: {
    id: string
    update: UnitUserUpdateDto
  }): Promise<UnitUser> {
    this.logger.log('update-unit-user')
    try {
      return await this.unitUserRepository.save({
        id,
        ...update,
        building: update.buildId ? { id: update.buildId } : null,
        unit: update.unitId ? { id: update.unitId } : undefined,
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteUnitUser(id: string): Promise<boolean> {
    this.logger.log('delete-unit-user')
    try {
      await this.unitUserRepository.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
