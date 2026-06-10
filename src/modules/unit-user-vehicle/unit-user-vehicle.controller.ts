import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { RequestAdminUserModel } from 'src/model/request.model'
import { AdminJwtAuthGuard } from 'src/modules/auth/guard/admin-auth.guard'
import { UnitUserVehicle } from './entities/unit-user-vehicle.entity'
import { UnitUserVehicleService } from './unit-user-vehicle.service'
import {
  VehicleCreateDto,
  VehicleLookupDto,
  VehicleQueryDto,
  VehicleUpdateDto,
} from './dto/unit-user-vehicle.dto'

@ApiTags('Unit User Vehicle')
@Controller('unit-user-vehicle')
@ApiBearerAuth('Admin Authorization')
@UseGuards(AdminJwtAuthGuard)
export class UnitUserVehicleController {
  constructor(private readonly service: UnitUserVehicleService) {}

  @Get()
  async getAll(
    @Query() query: VehicleQueryDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<UnitUserVehicle[]>> {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      const { data, total } = await this.service.getAll(query, adminUnitIds)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('lookup')
  async lookup(
    @Query() query: VehicleLookupDto,
  ): Promise<ResponseModel<UnitUserVehicle[]>> {
    try {
      const data = await this.service.getByLicensePlateAndIdCard(
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

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const data = await this.service.getById(id)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post()
  async create(
    @Body() dto: VehicleCreateDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const adminId = req.user?.id
      const data = await this.service.create(dto, adminId)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: VehicleUpdateDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const adminId = req.user?.id
      const data = await this.service.update({ id, update: dto, adminId })
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<string>> {
    try {
      const adminId = req.user?.id
      await this.service.delete(id, adminId)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
