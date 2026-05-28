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
import { UnitUserVehicleDocument } from './entities/unit-user-vehicle-document.entity'
import { UnitUserVehicleDocumentService } from './unit-user-vehicle-document.service'
import {
  UnitUserVehicleDocumentCreateDto,
  UnitUserVehicleDocumentQueryDto,
  UnitUserVehicleDocumentUpdateDto,
} from './dto/unit-user-vehicle-document.dto'

@ApiTags('Unit User Vehicle Document')
@Controller('unit-user-vehicle-document')
export class UnitUserVehicleDocumentController {
  constructor(private readonly service: UnitUserVehicleDocumentService) {}

  @Get()
  async getAll(
    @Query() query: UnitUserVehicleDocumentQueryDto,
  ): Promise<ResponseModel<UnitUserVehicleDocument[]>> {
    try {
      const { data, total } = await this.service.getAll(query)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<UnitUserVehicleDocument>> {
    try {
      const data = await this.service.getById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: UnitUserVehicleDocumentCreateDto,
  ): Promise<ResponseModel<UnitUserVehicleDocument>> {
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
    @Body() dto: UnitUserVehicleDocumentUpdateDto,
  ): Promise<ResponseModel<UnitUserVehicleDocument>> {
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
