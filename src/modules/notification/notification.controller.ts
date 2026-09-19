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
import { NotificationService } from './notification.service'
import { Notification } from './entities/notification.entity'
import { NotificationCreateDto } from './dto/notification.dto'

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ---------- Admin ----------

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Get()
  async getNotifications(
    @Query('take') take?: string,
    @Query('page') page?: string,
  ): Promise<ResponseModel<Notification[]>> {
    try {
      const { notifications, total } = await this.notificationService.getNotifications({ take: take ? Number(take) : undefined, page: page ? Number(page) : undefined })
      return { data: notifications, meta: { total } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Post()
  async createNotification(
    @Request() req: any,
    @Body() dto: NotificationCreateDto,
  ): Promise<ResponseModel<Notification>> {
    try {
      return {
        data: await this.notificationService.createNotification(dto, req.user.id),
      }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Get(':id/recipients')
  async getRecipients(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const detail = await this.notificationService.getNotificationWithRecipients(id)
      return { data: detail }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.SUPER_ADMIN, PersonnelAdminRole.PERSONNEL)
  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Notification>> {
    try {
      return { data: await this.notificationService.deleteNotification(id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  // ---------- User ----------

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Get('my')
  async getMyNotifications(
    @Request() req: RequestPersonnelModel,
  ): Promise<ResponseModel<any>> {
    try {
      const result = await this.notificationService.getMyNotifications(req.user.id)
      return { data: result.items, meta: { total: result.total, unreadCount: result.unreadCount } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Post('my/read-all')
  async markAllRead(@Request() req: RequestPersonnelModel) {
    try {
      await this.notificationService.markAllRead(req.user.id)
      return { data: { success: true } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Post('my/:id/read')
  async markRead(
    @Request() req: RequestPersonnelModel,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    try {
      await this.notificationService.markRead(id, req.user.id)
      return { data: { success: true } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
