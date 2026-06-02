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
import { NotUnitUser } from './entities/not-unit-user.entity'
import { NotUnitUserService } from './not-unit-user.service'
import {
  NotUnitUserCreateDto,
  NotUnitUserQueryDto,
  NotUnitUserUpdateDto,
} from './dto/not-unit-user.dto'

@ApiTags('Not Unit User')
@Controller('not-unit-user')
export class NotUnitUserController {
  constructor(private readonly notUnitUserService: NotUnitUserService) {}

  @Get()
  async getAll(
    @Query() query: NotUnitUserQueryDto,
  ): Promise<ResponseModel<NotUnitUser[]>> {
    try {
      const { data, total } = await this.notUnitUserService.getAllNotUnitUsers(query)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('id-card/:idCardNo')
  async getByIdCard(
    @Param('idCardNo') idCardNo: string,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const data = await this.notUnitUserService.getNotUnitUserByIdCard(idCardNo)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const data = await this.notUnitUserService.getNotUnitUserById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: NotUnitUserCreateDto,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const data = await this.notUnitUserService.createNotUnitUser(dto)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: NotUnitUserUpdateDto,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const data = await this.notUnitUserService.updateNotUnitUser({
        id,
        update: dto,
      })
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
      await this.notUnitUserService.deleteNotUnitUser(id)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
