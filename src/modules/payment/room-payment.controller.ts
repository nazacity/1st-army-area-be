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
import { PersonnelAdminJwtAuthGuard } from '../auth/guard/personnel-admin-auth.guard'
import { PersonnelJwtAuthGuard } from '../auth/guard/personnel-auth.guard'
import { PersonnelPasswordChangedGuard } from 'src/common/guards/personnel-password-changed.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { PersonnelAdminRole } from '../personnel-admin/entities/personnel-admin.entity'
import { RoomPaymentService } from './room-payment.service'
import { RoomPayment } from './entities/room-payment.entity'
import { RejectPaymentDto } from './dto/user-payment.dto'
import {
  CreateRoomPaymentDto,
  RoomPaymentQueryDto,
  UpdateRoomPaymentDto,
} from './dto/room-payment.dto'

@ApiTags('Room Payment')
@Controller('room-payments')
export class RoomPaymentController {
  constructor(private readonly paymentService: RoomPaymentService) {}

  @ApiBearerAuth('Personnel Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Get()
  async getRoomPayments(
    @Query() query: RoomPaymentQueryDto,
  ): Promise<ResponseModel<RoomPayment[]>> {
    try {
      const { payments, total } = await this.paymentService.getRoomPayments(
        query,
      )

      return { data: payments, meta: { total } }
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
  @Get('/my-room')
  async getMyRoomPayments(
    @Request() req: RequestPersonnelModel,
  ): Promise<ResponseModel<RoomPayment[]>> {
    try {
      const payments = await this.paymentService.getMyRoomPayments(
        req.user.id,
      )

      return { data: payments, meta: { total: payments.length } }
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
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Get('/room/:roomId')
  async getRoomPaymentsByRoom(
    @Param('roomId') roomId: string,
  ): Promise<ResponseModel<RoomPayment[]>> {
    try {
      const payments = await this.paymentService.getRoomPaymentsByRoom(roomId)

      return { data: payments, meta: { total: payments.length } }
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
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Get('/summary')
  async getSummary(
    @Query() query: RoomPaymentQueryDto,
  ): Promise<ResponseModel<any>> {
    try {
      const summary = await this.paymentService.getSummary(query)

      return { data: summary }
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
  @AdminRoles(PersonnelAdminRole.BUILDING, PersonnelAdminRole.PERSONNEL)
  @Post()
  async createRoomPayment(
    @Body() dto: CreateRoomPaymentDto,
  ): Promise<ResponseModel<RoomPayment>> {
    try {
      const payment = await this.paymentService.createRoomPayment(dto)

      return { data: payment }
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
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Get('/:id')
  async getRoomPaymentById(
    @Param('id') id: string,
  ): Promise<ResponseModel<RoomPayment>> {
    try {
      const payment = await this.paymentService.getRoomPaymentById(id)

      return { data: payment }
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
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Patch('/:id')
  async updateRoomPayment(
    @Param('id') id: string,
    @Body() dto: UpdateRoomPaymentDto,
  ): Promise<ResponseModel<RoomPayment>> {
    try {
      const payment = await this.paymentService.updateRoomPayment(id, dto)

      return { data: payment }
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
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Delete('/:id')
  async deleteRoomPayment(
    @Param('id') id: string,
  ): Promise<ResponseModel<RoomPayment>> {
    try {
      const payment = await this.paymentService.deleteRoomPayment(id)

      return { data: payment }
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
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Post('/:id/confirm')
  async confirmRoomPayment(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ResponseModel<RoomPayment>> {
    try {
      const payment = await this.paymentService.confirmRoomPayment(
        id,
        req.user.id,
      )

      return { data: payment }
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
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Post('/:id/reject')
  async rejectRoomPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
  ): Promise<ResponseModel<RoomPayment>> {
    try {
      const payment = await this.paymentService.rejectRoomPayment(
        id,
        req.user.id,
        dto.remark,
      )

      return { data: payment }
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
