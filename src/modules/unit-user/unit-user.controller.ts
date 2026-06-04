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
import { ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { RequestAdminUserModel } from 'src/model/request.model'
import { AdminJwtAuthGuard } from 'src/modules/auth/guard/admin-auth.guard'
import { UnitUser } from './entities/unit-user.entity'
import { UnitUserService } from './unit-user.service'
import {
  IDCardUnitUserQueryDto,
  UnitUserCreateDto,
  UnitUserQueryDto,
  UnitUserUpdateDto,
} from './dto/unit-user.dto'

@ApiTags('Unit User')
@Controller('unit-user')
@UseGuards(AdminJwtAuthGuard)
export class UnitUserController {
  constructor(private readonly unitUserService: UnitUserService) {}

  @Get()
  async getAll(
    @Query() query: UnitUserQueryDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<UnitUser[]>> {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      const { data, total } = await this.unitUserService.getAllUnitUsers(query, adminUnitIds)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('id-card')
  async getByIdCard(
    @Query() query: IDCardUnitUserQueryDto,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.getUnitUserByIdCard(query)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('soldier-no/:soldierNo')
  async getBySoldierNo(
    @Param('soldierNo') soldierNo: string,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.getUnitUserBySoldierNo(soldierNo)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('id-card-no/:idCardNo')
  async getByIdCardNo(
    @Param('idCardNo') idCardNo: string,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.getUnitUserByIdCardNo(idCardNo)
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
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const data = await this.unitUserService.getUnitUserById(id)
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
    @Body() dto: UnitUserCreateDto,
    @Request() req?: RequestAdminUserModel,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const adminId = (req as RequestAdminUserModel)?.user?.id
      const data = await this.unitUserService.createUnitUser(dto, adminId)
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
    @Body() dto: UnitUserUpdateDto,
    @Request() req?: RequestAdminUserModel,
  ): Promise<ResponseModel<UnitUser>> {
    try {
      const adminId = (req as RequestAdminUserModel)?.user?.id
      const data = await this.unitUserService.updateUnitUser({
        id,
        update: dto,
        adminId,
      })
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
    @Request() req?: RequestAdminUserModel,
  ): Promise<ResponseModel<string>> {
    try {
      const adminId = (req as RequestAdminUserModel)?.user?.id
      await this.unitUserService.deleteUnitUser(id, adminId)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
