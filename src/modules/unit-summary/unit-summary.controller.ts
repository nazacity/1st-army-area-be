import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { RequestAdminUserModel } from 'src/model/request.model'
import { AdminJwtAuthGuard } from 'src/modules/auth/guard/admin-auth.guard'
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
@ApiBearerAuth('Admin Authorization')
@UseGuards(AdminJwtAuthGuard)
export class UnitSummaryController {
  constructor(private readonly unitSummaryService: UnitSummaryService) {}

  @Get('unit-user')
  async getUnitUsers(
    @Query() query: UnitUserSummaryQueryDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<UnitUser[]>> {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      return await this.unitSummaryService.getUnitUsers(query, adminUnitIds)
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
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<NotUnitUser[]>> {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      return await this.unitSummaryService.getNotUnitUsers(query, adminUnitIds)
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
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<UnitUserVehicle[]>> {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      return await this.unitSummaryService.getVehicles(query, adminUnitIds)
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
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Building[]>> {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      return await this.unitSummaryService.getBuildings(query, adminUnitIds)
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('unit-user/election-location-summary')
  async getUnitUserElectionLocationSummary(
    @Request() req: RequestAdminUserModel,
  ) {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      return await this.unitSummaryService.getUnitUserElectionLocationSummary(
        adminUnitIds,
      )
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('not-unit-user/election-location-summary')
  async getNotUnitUserElectionLocationSummary(
    @Request() req: RequestAdminUserModel,
  ) {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      return await this.unitSummaryService.getNotUnitUserElectionLocationSummary(
        adminUnitIds,
      )
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
