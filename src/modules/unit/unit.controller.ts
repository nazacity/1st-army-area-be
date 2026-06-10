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
import { Unit } from './entities/unit.entity'
import { UnitService } from './unit.service'
import { UnitCreateDto, UnitQueryDto, UnitUpdateDto } from './dto/unit.dto'

@ApiTags('Unit')
@Controller('unit')
@ApiBearerAuth('Admin Authorization')
@UseGuards(AdminJwtAuthGuard)
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  async getAll(
    @Query() query: UnitQueryDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Unit[]>> {
    try {
      const adminUnitIds = req.user.units?.map((u) => u.id) ?? []
      const { data, total } = await this.unitService.getAllUnits(
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

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<Unit>> {
    try {
      const data = await this.unitService.getUnitById(id)
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
    @Body() dto: UnitCreateDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Unit>> {
    try {
      if (req.user.units?.length > 0) {
        throw new HttpException(
          { message: 'ไม่มีสิทธิ์จัดการหน่วย' },
          HttpStatus.FORBIDDEN,
        )
      }
      const adminId = req.user?.id
      const data = await this.unitService.createUnit(dto, adminId)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        error.status ?? HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UnitUpdateDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Unit>> {
    try {
      if (req.user.units?.length > 0) {
        throw new HttpException(
          { message: 'ไม่มีสิทธิ์จัดการหน่วย' },
          HttpStatus.FORBIDDEN,
        )
      }
      const adminId = req.user?.id
      const data = await this.unitService.updateUnit({
        id,
        update: dto,
        adminId,
      })
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        error.status ?? HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<string>> {
    try {
      if (req.user.units?.length > 0) {
        throw new HttpException(
          { message: 'ไม่มีสิทธิ์จัดการหน่วย' },
          HttpStatus.FORBIDDEN,
        )
      }
      const adminId = req.user?.id
      await this.unitService.deleteUnit(id, adminId)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        error.status ?? HttpStatus.BAD_REQUEST,
      )
    }
  }
}
