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
import { UnitUserVehicleSticker } from './entities/unit-user-vehicle-sticker.entity'
import { UnitUserVehicleStickerService } from './unit-user-vehicle-sticker.service'
import {
  VehicleStickerCreateDto,
  VehicleStickerUpdateDto,
} from './dto/unit-user-vehicle-sticker.dto'

@ApiTags('Unit User Vehicle Sticker')
@Controller('unit-user-vehicle-sticker')
export class UnitUserVehicleStickerController {
  constructor(private readonly service: UnitUserVehicleStickerService) {}

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<UnitUserVehicleSticker>> {
    try {
      const data = await this.service.getById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: VehicleStickerCreateDto,
  ): Promise<ResponseModel<UnitUserVehicleSticker>> {
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
    @Body() dto: VehicleStickerUpdateDto,
  ): Promise<ResponseModel<UnitUserVehicleSticker>> {
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
