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
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { RequestPersonnelModel } from 'src/model/request.model'
import { AdminJwtAuthGuard } from '../auth/guard/admin-auth.guard'
import { PersonnelJwtAuthGuard } from '../auth/guard/personnel-auth.guard'
import { PersonnelPasswordChangedGuard } from 'src/common/guards/personnel-password-changed.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { AdminRole } from '../admin/entities/admin.entity'
import { PersonnelService } from './personnel.service'
import { Personnel } from './entities/personnel.entity'
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard)
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard)
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(AdminRole.PERSONNEL)
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(AdminRole.PERSONNEL)
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(AdminRole.PERSONNEL)
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(AdminRole.PERSONNEL, AdminRole.IT)
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
