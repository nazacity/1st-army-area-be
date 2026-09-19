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
import { PersonnelAdminJwtAuthGuard } from '../auth/guard/personnel-admin-auth.guard'
import { PersonnelJwtAuthGuard } from '../auth/guard/personnel-auth.guard'
import { PersonnelPasswordChangedGuard } from 'src/common/guards/personnel-password-changed.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { PersonnelAdminRole } from '../personnel-admin/entities/personnel-admin.entity'
import { RequestPersonnelModel } from 'src/model/request.model'
import { AnnouncementService } from './announcement.service'
import { Announcement } from './entities/announcement.entity'
import {
  AnnouncementCreateDto,
  AnnouncementDisplayDto,
  AnnouncementPinDto,
} from './dto/announcement.dto'

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  // ---------- Admin ----------

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Get()
  async getAnnouncements(
    @Query('take') take?: string,
    @Query('page') page?: string,
  ): Promise<ResponseModel<Announcement[]>> {
    try {
      const { announcements, total } = await this.announcementService.getAnnouncements({ take: take ? Number(take) : undefined, page: page ? Number(page) : undefined })
      return { data: announcements, meta: { total } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Post()
  async createAnnouncement(
    @Request() req: any,
    @Body() dto: AnnouncementCreateDto,
  ): Promise<ResponseModel<Announcement>> {
    try {
      return {
        data: await this.announcementService.createAnnouncement(dto, req.user.id),
      }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Patch(':id')
  async updateAnnouncement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnnouncementCreateDto,
  ): Promise<ResponseModel<Announcement>> {
    try {
      return { data: await this.announcementService.updateAnnouncement(id, dto) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Patch(':id/display')
  async updateDisplay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnnouncementDisplayDto,
  ): Promise<ResponseModel<Announcement>> {
    try {
      return { data: await this.announcementService.updateDisplay(id, dto.display) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Patch(':id/pin')
  async updatePin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnnouncementPinDto,
  ): Promise<ResponseModel<Announcement>> {
    try {
      return { data: await this.announcementService.updatePin(id, dto.pin) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Delete(':id')
  async deleteAnnouncement(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Announcement>> {
    try {
      return { data: await this.announcementService.deleteAnnouncement(id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  // ---------- User ----------

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Get('my')
  async getMyAnnouncements(): Promise<ResponseModel<Announcement[]>> {
    try {
      const announcements = await this.announcementService.getMyAnnouncements()
      return { data: announcements, meta: { total: announcements.length } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
