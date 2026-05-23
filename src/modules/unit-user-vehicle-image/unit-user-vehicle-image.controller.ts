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
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { UnitUserVehicleImage } from './entities/unit-user-vehicle-image.entity'
import { UnitUserVehicleImageService } from './unit-user-vehicle-image.service'
import {
  UnitUserVehicleImageCreateDto,
  UnitUserVehicleImageUpdateDto,
} from './dto/unit-user-vehicle-image.dto'

@ApiTags('Unit User Vehicle Image')
@Controller('unit-user-vehicle-image')
export class UnitUserVehicleImageController {
  constructor(private readonly service: UnitUserVehicleImageService) {}

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<UnitUserVehicleImage>> {
    try {
      const data = await this.service.getById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: UnitUserVehicleImageCreateDto,
  ): Promise<ResponseModel<UnitUserVehicleImage>> {
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
    @Body() dto: UnitUserVehicleImageUpdateDto,
  ): Promise<ResponseModel<UnitUserVehicleImage>> {
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
