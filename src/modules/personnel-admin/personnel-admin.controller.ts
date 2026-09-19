import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { RequestPersonnelAdminModel } from 'src/model/request.model'
import { ResponseModel } from 'src/model/response.model'
import { PersonnelAdminJwtAuthGuard } from '../auth/guard/personnel-admin-auth.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { PersonnelAdminService } from './personnel-admin.service'
import {
  PersonnelAdminCreateDto,
  PersonnelAdminQueryDto,
  PersonnelAdminUpdateDto,
} from './dto/personnel-admin.dto'
import {
  PersonnelAdmin,
  PersonnelAdminRole,
} from './entities/personnel-admin.entity'

@ApiTags('Personnel Admin Services')
@Controller('personnel-admins')
export class PersonnelAdminController {
  constructor(
    private readonly personnelAdminService: PersonnelAdminService,
  ) {}

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get('/info')
  async getPersonnelAdminByToken(
    @Request() req: RequestPersonnelAdminModel,
  ): Promise<ResponseModel<PersonnelAdmin>> {
    try {
      return { data: req.user }
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
  @Get('/roles')
  async getPersonnelAdminRoles(): Promise<ResponseModel<string[]>> {
    return { data: Object.values(PersonnelAdminRole) }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.IT)
  @Get()
  async getPersonnelAdmins(
    @Query() query: PersonnelAdminQueryDto,
  ): Promise<ResponseModel<PersonnelAdmin[]>> {
    try {
      const { personnelAdmins, total } =
        await this.personnelAdminService.getPersonnelAdmins(query)
      return { data: personnelAdmins, meta: { total } }
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
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.IT)
  @Post()
  async createPersonnelAdmin(
    @Body() personnelAdminCreateDto: PersonnelAdminCreateDto,
  ): Promise<ResponseModel<PersonnelAdmin>> {
    try {
      const createdPersonnelAdmin =
        await this.personnelAdminService.createPersonnelAdmin(
          personnelAdminCreateDto,
        )

      return { data: createdPersonnelAdmin }
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
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.IT)
  @Patch('/super/:id')
  async updatePersonnelAdmin(
    @Param('id') id: string,
    @Body() personnelAdminUpdateDto: PersonnelAdminUpdateDto,
  ): Promise<ResponseModel<PersonnelAdmin>> {
    try {
      const updatedPersonnelAdmin =
        await this.personnelAdminService.updatePersonnelAdmin({
          personnelAdminId: id,
          personnelAdminUpdateDto,
        })

      return { data: updatedPersonnelAdmin }
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
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN)
  @Delete('/:id')
  async deletePersonnelAdmin(
    @Param('id') id: string,
    @Request() req: RequestPersonnelAdminModel,
  ): Promise<ResponseModel<PersonnelAdmin>> {
    if (req.user.id === id) {
      throw new ForbiddenException('ไม่สามารถลบบัญชีตัวเองได้')
    }

    try {
      const deletedPersonnelAdmin =
        await this.personnelAdminService.deletePersonnelAdmin({
          personnelAdminId: id,
        })
      return { data: deletedPersonnelAdmin }
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
