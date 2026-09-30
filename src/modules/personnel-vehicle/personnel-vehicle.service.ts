import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { Personnel } from '../personnel/entities/personnel.entity'
import {
  PersonnelVehicle,
  PersonnelVehicleType,
} from './entities/personnel-vehicle.entity'
import {
  CreateMyPersonnelVehicleDto,
  CreatePersonnelVehicleDto,
  PersonnelVehicleQueryDto,
  UpdatePersonnelVehicleDto,
} from './dto/personnel-vehicle.dto'

@Injectable()
export class PersonnelVehicleService {
  private readonly logger = new Logger(PersonnelVehicleService.name)

  constructor(
    @InjectRepository(PersonnelVehicle)
    private readonly vehicleRepository: Repository<PersonnelVehicle>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  async getAll(query: PersonnelVehicleQueryDto): Promise<{
    vehicles: PersonnelVehicle[]
    total: number
  }> {
    try {
      const take = query?.take ? Number(query.take) : 10
      const page = query?.page ? Number(query.page) : 1
      const skip = take === -1 ? undefined : (page - 1) * take

      const qb = this.vehicleRepository
        .createQueryBuilder('v')
        .leftJoinAndSelect('v.personnel', 'personnel')
        .where('v.isDeleted = false')

      if (query?.personnelId) {
        qb.andWhere('v.personnelId = :personnelId', {
          personnelId: query.personnelId,
        })
      }
      if (query?.type) {
        qb.andWhere('v.type = :type', { type: query.type })
      }
      if (query?.searchText) {
        qb.andWhere(
          new Brackets((qb2) => {
            qb2
              .where('v.licensePlate ILIKE :search')
              .orWhere('v.ownerFullName ILIKE :search')
              .orWhere('v.brand ILIKE :search')
              .orWhere('v.model ILIKE :search')
              .orWhere('v.province ILIKE :search')
              .orWhere('personnel.firstName ILIKE :search')
              .orWhere('personnel.lastName ILIKE :search')
              .orWhere('personnel.username ILIKE :search')
          }),
        )
        qb.setParameter('search', `%${query.searchText}%`)
      }

      qb.orderBy('v.createdAt', 'DESC')
      if (skip !== undefined) {
        qb.skip(skip).take(take)
      }

      const [vehicles, total] = await qb.getManyAndCount()
      return { vehicles, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getById(id: string): Promise<PersonnelVehicle> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['personnel'],
      })

      if (!vehicle) throw new Error('Personnel vehicle is not found')
      return vehicle
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async create(dto: CreatePersonnelVehicleDto): Promise<PersonnelVehicle> {
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id: dto.personnelId, isDeleted: false },
      })
      if (!personnel) throw new Error('Personnel is not found')

      await this.assertNoDuplicatePlate(dto.licensePlate, dto.personnelId)

      const vehicle = this.vehicleRepository.create(dto)
      return await this.vehicleRepository.save(vehicle)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async update(
    id: string,
    dto: UpdatePersonnelVehicleDto,
  ): Promise<PersonnelVehicle> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id, isDeleted: false },
      })
      if (!vehicle) throw new Error('Personnel vehicle is not found')

      if (dto.personnelId && dto.personnelId !== vehicle.personnelId) {
        const personnel = await this.personnelRepository.findOne({
          where: { id: dto.personnelId, isDeleted: false },
        })
        if (!personnel) throw new Error('Personnel is not found')
      }

      const plate = dto.licensePlate ?? vehicle.licensePlate
      const personnelId = dto.personnelId ?? vehicle.personnelId
      await this.assertNoDuplicatePlate(plate, personnelId, id)

      return await this.vehicleRepository.save({ ...vehicle, ...dto })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async delete(id: string): Promise<PersonnelVehicle> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id, isDeleted: false },
      })
      if (!vehicle) throw new Error('Personnel vehicle is not found')

      vehicle.isDeleted = true
      return await this.vehicleRepository.save(vehicle)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  // ---------- ของตัวเอง (user) ----------

  async getMy(personnelId: string): Promise<PersonnelVehicle[]> {
    try {
      return await this.vehicleRepository.find({
        where: { personnelId, isDeleted: false },
        order: { createdAt: 'DESC' },
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createMy(
    personnelId: string,
    dto: CreateMyPersonnelVehicleDto,
  ): Promise<PersonnelVehicle> {
    try {
      await this.assertNoDuplicatePlate(dto.licensePlate, personnelId)

      const vehicle = this.vehicleRepository.create({
        ...dto,
        personnelId,
      })
      return await this.vehicleRepository.save(vehicle)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateMy(
    personnelId: string,
    id: string,
    dto: UpdatePersonnelVehicleDto,
  ): Promise<PersonnelVehicle> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id, personnelId, isDeleted: false },
      })
      if (!vehicle) throw new Error('Personnel vehicle is not found')

      if (dto.licensePlate) {
        await this.assertNoDuplicatePlate(dto.licensePlate, personnelId, id)
      }

      return await this.vehicleRepository.save({ ...vehicle, ...dto })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteMy(personnelId: string, id: string): Promise<PersonnelVehicle> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id, personnelId, isDeleted: false },
      })
      if (!vehicle) throw new Error('Personnel vehicle is not found')

      vehicle.isDeleted = true
      return await this.vehicleRepository.save(vehicle)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  private async assertNoDuplicatePlate(
    licensePlate: string,
    personnelId: string,
    excludeId?: string,
  ): Promise<void> {
    const plate = licensePlate.trim()
    const existing = await this.vehicleRepository.findOne({
      where: { licensePlate: plate, personnelId, isDeleted: false },
    })

    if (existing && existing.id !== excludeId) {
      throw new Error('ทะเบียนนี้มีอยู่ในรายการยานพาหนะของผู้นี้แล้ว')
    }
  }
}
