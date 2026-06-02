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
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { UnitUserVehicle } from './entities/unit-user-vehicle.entity'
import { UnitUserVehicleService } from './unit-user-vehicle.service'
import { VehicleCreateDto, VehicleQueryDto, VehicleUpdateDto } from './dto/unit-user-vehicle.dto'

@ApiTags('Unit User Vehicle')
@Controller('unit-user-vehicle')
export class UnitUserVehicleController {
  constructor(private readonly service: UnitUserVehicleService) {}

  @Get()
  async getAll(
    @Query() query: VehicleQueryDto,
  ): Promise<ResponseModel<UnitUserVehicle[]>> {
    try {
      const { data, total } = await this.service.getAll(query)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('license-plate/:licensePlate')
  async getByLicensePlate(
    @Param('licensePlate') licensePlate: string,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const data = await this.service.getByLicensePlate(licensePlate)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
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
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: VehicleCreateDto,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const data = await this.service.create(dto)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: VehicleUpdateDto,
  ): Promise<ResponseModel<UnitUserVehicle>> {
    try {
      const data = await this.service.update({ id, update: dto })
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<string>> {
    try {
      await this.service.delete(id)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
