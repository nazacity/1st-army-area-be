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
import { UnitUser } from './entities/unit-user.entity'
import { UnitUserService } from './unit-user.service'
import {
  UnitUserCreateDto,
  UnitUserQueryDto,
  UnitUserUpdateDto,
} from './dto/unit-user.dto'

@ApiTags('Unit User')
@Controller('unit-user')
export class UnitUserController {
  constructor(private readonly unitUserService: UnitUserService) {}

  @Get()
  async getAll(
    @Query() query: UnitUserQueryDto,
  ): Promise<ResponseModel<UnitUser[]>> {
    try {
      const { data, total } = await this.unitUserService.getAllUnitUsers(query)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.getUnitUserById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: UnitUserCreateDto,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.createUnitUser(dto)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UnitUserUpdateDto,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.updateUnitUser({
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
      await this.unitUserService.deleteUnitUser(id)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
