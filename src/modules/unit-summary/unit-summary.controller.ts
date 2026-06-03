import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { UnitSummaryService } from './unit-summary.service'
import {
  BuildingSummaryQueryDto,
  NotUnitUserSummaryQueryDto,
  UnitUserSummaryQueryDto,
  VehicleSummaryQueryDto,
} from './dto/unit-summary.dto'
import { UnitUser } from '../unit-user/entities/unit-user.entity'
import { NotUnitUser } from '../not-unit-user/entities/not-unit-user.entity'
import { UnitUserVehicle } from '../unit-user-vehicle/entities/unit-user-vehicle.entity'
import { Building } from '../building/entities/building.entity'

@ApiTags('Unit Summary')
@Controller('unit-summary')
export class UnitSummaryController {
  constructor(private readonly unitSummaryService: UnitSummaryService) {}

  @Get('unit-user')
  async getUnitUsers(
    @Query() query: UnitUserSummaryQueryDto,
  ): Promise<ResponseModel<UnitUser[]>> {
    try {
      return await this.unitSummaryService.getUnitUsers(query)
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('not-unit-user')
  async getNotUnitUsers(
    @Query() query: NotUnitUserSummaryQueryDto,
  ): Promise<ResponseModel<NotUnitUser[]>> {
    try {
      return await this.unitSummaryService.getNotUnitUsers(query)
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('vehicle')
  async getVehicles(
    @Query() query: VehicleSummaryQueryDto,
  ): Promise<ResponseModel<UnitUserVehicle[]>> {
    try {
      return await this.unitSummaryService.getVehicles(query)
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('building')
  async getBuildings(
    @Query() query: BuildingSummaryQueryDto,
  ): Promise<ResponseModel<Building[]>> {
    try {
      return await this.unitSummaryService.getBuildings(query)
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('unit-user/election-location-summary')
  async getUnitUserElectionLocationSummary() {
    try {
      return await this.unitSummaryService.getUnitUserElectionLocationSummary()
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('not-unit-user/election-location-summary')
  async getNotUnitUserElectionLocationSummary() {
    try {
      return await this.unitSummaryService.getNotUnitUserElectionLocationSummary()
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
