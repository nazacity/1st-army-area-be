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
import { NotUnitUser } from './entities/not-unit-user.entity'
import { NotUnitUserService } from './not-unit-user.service'
import {
  NotUnitUserCreateDto,
  NotUnitUserLookupDto,
  NotUnitUserQueryDto,
  NotUnitUserUpdateDto,
} from './dto/not-unit-user.dto'

@ApiTags('Not Unit User')
@Controller('not-unit-user')
@ApiBearerAuth('Admin Authorization')
@UseGuards(AdminJwtAuthGuard)
export class NotUnitUserController {
  constructor(private readonly notUnitUserService: NotUnitUserService) {}

  @Get()
  async getAll(
    @Query() query: NotUnitUserQueryDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<NotUnitUser[]>> {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      const { data, total } = await this.notUnitUserService.getAllNotUnitUsers(
        query,
        adminUnitIds,
      )
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
    @Query() query: NotUnitUserLookupDto,
  ): Promise<ResponseModel<NotUnitUser[]>> {
    try {
      const data = await this.notUnitUserService.getByIdCardAndUnitUserIdCard(
        query.idCardNo,
        query.unitUserIdCard,
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
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const data = await this.notUnitUserService.getNotUnitUserById(id)
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
    @Body() dto: NotUnitUserCreateDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const adminId = req.user?.id
      const data = await this.notUnitUserService.createNotUnitUser(dto, adminId)
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
    @Body() dto: NotUnitUserUpdateDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<NotUnitUser>> {
    try {
      const adminId = req.user?.id
      const data = await this.notUnitUserService.updateNotUnitUser({
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
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<string>> {
    try {
      const adminId = req.user?.id
      await this.notUnitUserService.deleteNotUnitUser(id, adminId)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
