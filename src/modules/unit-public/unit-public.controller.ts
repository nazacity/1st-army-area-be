import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { Unit } from '../unit/entities/unit.entity'
import { UnitService } from '../unit/unit.service'
import { Building } from '../building/entities/building.entity'
import { BuildingService } from '../building/building.service'
import { BuildingQueryByPublicDto } from '../building/dto/building.dto'
import { UnitUser } from '../unit-user/entities/unit-user.entity'
import { UnitUserService } from '../unit-user/unit-user.service'
import { NotUnitUser } from '../not-unit-user/entities/not-unit-user.entity'
import { NotUnitUserService } from '../not-unit-user/not-unit-user.service'
import { UnitUserVehicle } from '../unit-user-vehicle/entities/unit-user-vehicle.entity'
import { UnitUserVehicleService } from '../unit-user-vehicle/unit-user-vehicle.service'
import {
  IDCardUnitUserQueryDto,
  UnitUserCreateDto,
  UnitUserUpdateDto,
} from '../unit-user/dto/unit-user.dto'
import {
  NotUnitUserCreateDto,
  NotUnitUserLookupDto,
  NotUnitUserUpdateDto,
} from '../not-unit-user/dto/not-unit-user.dto'
import {
  VehicleCreateDto,
  VehicleLookupDto,
  VehicleUpdateDto,
} from '../unit-user-vehicle/dto/unit-user-vehicle.dto'

@ApiTags('Unit Public')
@Controller('unit-public')
export class UnitPublicController {
  constructor(
    private readonly unitService: UnitService,
    private readonly buildingService: BuildingService,
    private readonly unitUserService: UnitUserService,
    private readonly notUnitUserService: NotUnitUserService,
    private readonly vehicleService: UnitUserVehicleService,
  ) {}

  // ── Unit ───────────────────────────────────────────────

  @Get()
  async getAllUnits(): Promise<ResponseModel<Unit[]>> {
    try {
      const { data, total } = await this.unitService.getAllUnitsByPublic()
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  // ── Building ───────────────────────────────────────────

  @Get('building')
  async getAllBuildingsByPublic(
    @Query() query: BuildingQueryByPublicDto,
  ): Promise<ResponseModel<Building[]>> {
    try {
      const { data, total } = await this.buildingService.getAllBuildingsByPublic(query)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  // ── Unit User ──────────────────────────────────────────

  @Get('unit-user/id-card')
  async getUnitUserByIdCard(
    @Query() query: IDCardUnitUserQueryDto,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.getUnitUserByIdCard(query)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post('unit-user')
  async createUnitUser(
    @Body() dto: UnitUserCreateDto,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.createUnitUser(dto)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Patch('unit-user/:id')
  async updateUnitUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UnitUserUpdateDto,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.updateUnitUser({ id, update: dto })
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  // ── Not Unit User ──────────────────────────────────────

  @Get('not-unit-user/:id')
  async getNotUnitUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const data = await this.notUnitUserService.getNotUnitUserById(id)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('not-unit-user/lookup')
  async lookupNotUnitUser(
    @Query() query: NotUnitUserLookupDto,
  ): Promise<ResponseModel<NotUnitUser[]>> {
    try {
      const data = await this.notUnitUserService.getByIdCardAndUnitUserIdCard(
        query.idCardNo,
        query.unitUserIdCard,
      )
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post('not-unit-user')
  async createNotUnitUser(
    @Body() dto: NotUnitUserCreateDto,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const data = await this.notUnitUserService.createNotUnitUser(dto)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Patch('not-unit-user/:id')
  async updateNotUnitUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: NotUnitUserUpdateDto,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const data = await this.notUnitUserService.updateNotUnitUser({ id, update: dto })
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  // ── Unit User Vehicle ──────────────────────────────────

  @Get('vehicle/:id')
  async getVehicleById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const data = await this.vehicleService.getById(id)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('vehicle/lookup')
  async lookupVehicle(
    @Query() query: VehicleLookupDto,
  ): Promise<ResponseModel<UnitUserVehicle[]>> {
    try {
      const data = await this.vehicleService.getByLicensePlateAndIdCard(
        query.licensePlate,
        query.idCardNo,
      )
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post('vehicle')
  async createVehicle(
    @Body() dto: VehicleCreateDto,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const data = await this.vehicleService.create(dto)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Patch('vehicle/:id')
  async updateVehicle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: VehicleUpdateDto,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const data = await this.vehicleService.update({ id, update: dto })
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
