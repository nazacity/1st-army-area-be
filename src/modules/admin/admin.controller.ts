import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { RequestAdminUserModel } from 'src/model/request.model'
import { ResponseModel } from 'src/model/response.model'
import { AdminJwtAuthGuard } from '../auth/guard/admin-auth.guard'
import { AdminService } from './admin.service'
import { AdminCreateDto, AdminUpdateDto } from './dto/admin.dto'
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

  @Post()
  async createAdmin(
    @Body() adminCreateDto: AdminCreateDto,
  ): Promise<ResponseModel<Admin>> {
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
}
