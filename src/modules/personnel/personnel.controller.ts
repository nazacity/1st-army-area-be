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
import { PersonnelService } from './personnel.service'
import { Personnel } from './entities/personnel.entity'
import {
  importPersonnel,
  updatePersonnelCsv,
  ImportReport,
} from './personnel-import.helper'
import {
  ChangePasswordDto,
  CreatePersonnelDto,
  PersonnelQueryDto,
  UpdateMeDto,
  UpdatePersonnelDto,
} from './dto/personnel.dto'

@ApiTags('Personnel')
@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @InjectDataSource()
  private readonly dataSource: DataSource

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get()
  async getPersonnels(
    @Query() query: PersonnelQueryDto,
  ): Promise<ResponseModel<Personnel[]>> {
    try {
      const { personnels, total } = await this.personnelService.getPersonnels(
        query,
      )

      return { data: personnels, meta: { total } }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  // รายชื่อเพื่อนร่วมรุ่น (ผู้ใช้เห็นเท่านั้น — ไม่มี action)
  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Get('/my-peers')
  async getMyPeers(
    @Query() query: PersonnelQueryDto,
  ): Promise<ResponseModel<Personnel[]>> {
    try {
      const { personnels, total } = await this.personnelService.getPersonnels(
        query,
      )

      return { data: personnels, meta: { total } }
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
  @Get('/me')
  async getMe(
    @Request() req: RequestPersonnelModel,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.getPersonnelById(
        req.user.id,
      )

      return { data: personnel }
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
          description: 'ไฟล์ CSV 30 คอลัมน์ (Google Forms export) — สร้างใหม่เท่านั้น รายที่มี username อยู่แล้วจะถูกข้าม',
        },
      },
      required: ['file'],
    },
  })
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.IT)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/import')
  async importPersonnels(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<ImportReport>> {
    try {
      if (!file) throw new Error('CSV file is required')

      const report = await importPersonnel(
        this.dataSource,
        file.buffer.toString('utf-8'),
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'ไฟล์ CSV 30 คอลัมน์ (Google Forms export) — อัปเดตรายที่มี username อยู่แล้วเท่านั้น (ไม่แตะรหัสผ่านเดิม)',
        },
      },
      required: ['file'],
    },
  })
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.IT)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/import-update')
  async importPersonnelUpdates(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<ImportReport>> {
    try {
      if (!file) throw new Error('CSV file is required')

      const report = await updatePersonnelCsv(
        this.dataSource,
        file.buffer.toString('utf-8'),
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

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard)
  @Post('/change-password')
  async changePassword(
    @Request() req: RequestPersonnelModel,
    @Body() dto: ChangePasswordDto,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.changePassword(
        req.user.id,
        dto,
      )

      delete (personnel as any).password
      return { data: personnel }
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
  async getPersonnelById(
    @Param('id') id: string,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.getPersonnelById(id)

      return { data: personnel }
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
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Post()
  async createPersonnel(
    @Body() dto: CreatePersonnelDto,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.createPersonnel(dto)

      return { data: personnel }
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
  @Patch('/me')
  async updateMe(
    @Request() req: RequestPersonnelModel,
    @Body() dto: UpdateMeDto,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.updateMe(req.user.id, dto)

      return { data: personnel }
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
  @Post('/me/bind-line')
  async bindMyLine(
    @Request() req: RequestPersonnelModel,
    @Body() dto: { lineUserId: string },
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.bindLineUserId(
        req.user.id,
        dto.lineUserId,
      )

      delete (personnel as any).password
      return { data: personnel }
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
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Patch('/:id')
  async updatePersonnel(
    @Param('id') id: string,
    @Body() dto: UpdatePersonnelDto,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.updatePersonnel(id, dto)

      return { data: personnel }
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
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Delete('/:id')
  async deletePersonnel(
    @Param('id') id: string,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.deletePersonnel(id)

      return { data: personnel }
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
  @Post('/:id/reset-password')
  async resetPassword(
    @Param('id') id: string,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.personnelService.resetPassword(id)

      delete (personnel as any).password
      return { data: personnel }
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
