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
import { UnitUserDocument } from './entities/unit-user-document.entity'
import { UnitUserDocumentService } from './unit-user-document.service'
import {
  UnitUserDocumentCreateDto,
  UnitUserDocumentQueryDto,
  UnitUserDocumentUpdateDto,
} from './dto/unit-user-document.dto'

@ApiTags('Unit User Document')
@Controller('unit-user-document')
export class UnitUserDocumentController {
  constructor(private readonly service: UnitUserDocumentService) {}

  @Get()
  async getAll(
    @Query() query: UnitUserDocumentQueryDto,
  ): Promise<ResponseModel<UnitUserDocument[]>> {
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
  ): Promise<ResponseModel<UnitUserDocument>> {
    try {
      const data = await this.service.getById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: UnitUserDocumentCreateDto,
  ): Promise<ResponseModel<UnitUserDocument>> {
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
    @Body() dto: UnitUserDocumentUpdateDto,
  ): Promise<ResponseModel<UnitUserDocument>> {
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
