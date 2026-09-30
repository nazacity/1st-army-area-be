import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { ResponseModel } from 'src/model/response.model'
import { RequestPersonnelModel } from 'src/model/request.model'
import { PersonnelAdminJwtAuthGuard } from '../auth/guard/personnel-admin-auth.guard'
import { PersonnelJwtAuthGuard } from '../auth/guard/personnel-auth.guard'
import { PersonnelPasswordChangedGuard } from 'src/common/guards/personnel-password-changed.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { PersonnelAdminRole } from '../personnel-admin/entities/personnel-admin.entity'
import { PersonnelVehicle } from './entities/personnel-vehicle.entity'
import { PersonnelVehicleService } from './personnel-vehicle.service'
import {
  importPersonnelVehicles,
  VehicleImportReport,
} from './personnel-vehicle-import.helper'
import {
  CreateMyPersonnelVehicleDto,
  CreatePersonnelVehicleDto,
  PersonnelVehicleQueryDto,
  UpdatePersonnelVehicleDto,
} from './dto/personnel-vehicle.dto'

@ApiTags('Personnel Vehicle')
@Controller('personnel-vehicle')
export class PersonnelVehicleController {
  constructor(private readonly vehicleService: PersonnelVehicleService) {}

  @InjectDataSource()
  private readonly dataSource: DataSource

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get()
  async getVehicles(
    @Query() query: PersonnelVehicleQueryDto,
  ): Promise<ResponseModel<PersonnelVehicle[]>> {
    try {
      const { vehicles, total } = await this.vehicleService.getAll(query)

      return { data: vehicles, meta: { total } }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Get('/my')
  async getMyVehicles(
    @Request() req: RequestPersonnelModel,
  ): Promise<ResponseModel<PersonnelVehicle[]>> {
    try {
      const vehicles = await this.vehicleService.getMy(req.user.id)

      return { data: vehicles }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Post('/my')
  async createMyVehicle(
    @Request() req: RequestPersonnelModel,
    @Body() dto: CreateMyPersonnelVehicleDto,
  ): Promise<ResponseModel<PersonnelVehicle>> {
    try {
      const vehicle = await this.vehicleService.createMy(req.user.id, dto)

      return { data: vehicle }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Patch('/my/:id')
  async updateMyVehicle(
    @Request() req: RequestPersonnelModel,
    @Param('id') id: string,
    @Body() dto: UpdatePersonnelVehicleDto,
  ): Promise<ResponseModel<PersonnelVehicle>> {
    try {
      const vehicle = await this.vehicleService.updateMy(req.user.id, id, dto)

      return { data: vehicle }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Delete('/my/:id')
  async deleteMyVehicle(
    @Request() req: RequestPersonnelModel,
    @Param('id') id: string,
  ): Promise<ResponseModel<PersonnelVehicle>> {
    try {
      const vehicle = await this.vehicleService.deleteMy(req.user.id, id)

      return { data: vehicle }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'ไฟล์ Excel (.xlsx) sheet "รายการยานพาหนะ" — insert-only แถวที่ทะเบียนซ้ำในระบบจะถูกข้าม',
        },
      },
      required: ['file'],
    },
  })
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.IT)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/import')
  async importVehicles(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<VehicleImportReport>> {
    try {
      if (!file) throw new Error('Excel file is required')

      const report = await importPersonnelVehicles(
        this.dataSource,
        file.buffer,
      )

      return { data: report }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get('/:id')
  async getVehicleById(
    @Param('id') id: string,
  ): Promise<ResponseModel<PersonnelVehicle>> {
    try {
      const vehicle = await this.vehicleService.getById(id)

      return { data: vehicle }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.IT)
  @Post()
  async createVehicle(
    @Body() dto: CreatePersonnelVehicleDto,
  ): Promise<ResponseModel<PersonnelVehicle>> {
    try {
      const vehicle = await this.vehicleService.create(dto)

      return { data: vehicle }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.IT)
  @Patch('/:id')
  async updateVehicle(
    @Param('id') id: string,
    @Body() dto: UpdatePersonnelVehicleDto,
  ): Promise<ResponseModel<PersonnelVehicle>> {
    try {
      const vehicle = await this.vehicleService.update(id, dto)

      return { data: vehicle }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.IT)
  @Delete('/:id')
  async deleteVehicle(
    @Param('id') id: string,
  ): Promise<ResponseModel<PersonnelVehicle>> {
    try {
      const vehicle = await this.vehicleService.delete(id)

      return { data: vehicle }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
