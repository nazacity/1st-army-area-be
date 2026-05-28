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
import { NotUnitUserDocument } from './entities/not-unit-user-document.entity'
import { NotUnitUserDocumentService } from './not-unit-user-document.service'
import {
  NotUnitUserDocumentCreateDto,
  NotUnitUserDocumentQueryDto,
  NotUnitUserDocumentUpdateDto,
} from './dto/not-unit-user-document.dto'

@ApiTags('Not Unit User Document')
@Controller('not-unit-user-document')
export class NotUnitUserDocumentController {
  constructor(private readonly service: NotUnitUserDocumentService) {}

  @Get()
  async getAll(
    @Query() query: NotUnitUserDocumentQueryDto,
  ): Promise<ResponseModel<NotUnitUserDocument[]>> {
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
  ): Promise<ResponseModel<NotUnitUserDocument>> {
    try {
      const data = await this.service.getById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: NotUnitUserDocumentCreateDto,
  ): Promise<ResponseModel<NotUnitUserDocument>> {
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
    @Body() dto: NotUnitUserDocumentUpdateDto,
  ): Promise<ResponseModel<NotUnitUserDocument>> {
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
