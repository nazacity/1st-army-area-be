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
import { RequestAdminUserModel } from 'src/model/request.model'
import { ResponseModel } from 'src/model/response.model'
import { AdminJwtAuthGuard } from '../auth/guard/admin-auth.guard'
import { AdminService } from './admin.service'
import {
  AdminCreateDto,
  AdminQueryDto,
  AdminSuperUpdateDto,
  AdminUpdateDto,
} from './dto/admin.dto'
import { Admin } from './entities/admin.entity'

@ApiTags('Admin Services')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard)
  @Get('/info')
  async getAdminByToken(
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Admin>> {
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard)
  @Get()
  async getAdmins(
    @Query() query: AdminQueryDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Admin[]>> {
    const isSuperAdmin = req.user.units?.length === 0
    if (!isSuperAdmin) {
      throw new ForbiddenException('Only super admin can get all admins')
    }

    try {
      const { admins, total } = await this.adminService.getAdmins(query)
      return { data: admins, meta: { total } }
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
  @Post()
  async createAdmin(
    @Body() adminCreateDto: AdminCreateDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Admin>> {
    const isSuperAdmin = req.user.units?.length === 0
    if (!isSuperAdmin) {
      throw new ForbiddenException('Only super admin can create admin')
    }

    try {
      const createdAdmin = await this.adminService.createAdmin(adminCreateDto)

      return { data: createdAdmin }
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
  @Patch('/super/:id')
  async updateAdminBySuperAdmin(
    @Param('id') id: string,
    @Body() adminSuperUpdateDto: AdminSuperUpdateDto,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Admin>> {
    const isSuperAdmin = req.user.units?.length === 0
    if (!isSuperAdmin) {
      throw new ForbiddenException('Only super admin can update admin with units')
    }

    try {
      const updatedAdmin = await this.adminService.updateAdmin({
        adminId: id,
        adminUpdateDto: adminSuperUpdateDto,
      })

      return { data: updatedAdmin }
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
  @Patch('/:id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() adminUpdateDto: AdminUpdateDto,
  ): Promise<ResponseModel<Admin>> {
    try {
      const updatedAdmin = await this.adminService.updateAdmin({
        adminId: id,
        adminUpdateDto,
      })

      return { data: updatedAdmin }
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
  @Delete('/:id')
  async deleteAdmin(
    @Param('id') id: string,
    @Request() req: RequestAdminUserModel,
  ): Promise<ResponseModel<Admin>> {
    const isSuperAdmin = req.user.units?.length === 0
    if (!isSuperAdmin) {
      throw new ForbiddenException('Only super admin can delete admin')
    }

    try {
      const deletedAdmin = await this.adminService.deleteAdmin({ adminId: id })
      return { data: deletedAdmin }
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
