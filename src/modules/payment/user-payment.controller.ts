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
import { AuthGuard } from '@nestjs/passport'
import { ResponseModel } from 'src/model/response.model'
import { RequestPersonnelModel } from 'src/model/request.model'
import { PersonnelAdminJwtAuthGuard } from '../auth/guard/personnel-admin-auth.guard'
import { PersonnelJwtAuthGuard } from '../auth/guard/personnel-auth.guard'
import { PersonnelPasswordChangedGuard } from 'src/common/guards/personnel-password-changed.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { PersonnelAdminRole } from '../personnel-admin/entities/personnel-admin.entity'
import { PersonnelOrPaymentAdminGuard } from './guards/personnel-or-payment-admin.guard'
import { UserPaymentService } from './user-payment.service'
import { UserPayment } from './entities/user-payment.entity'
import {
  CreateUserPaymentDto,
  RejectPaymentDto,
  UpdateUserPaymentDto,
  UserPaymentQueryDto,
} from './dto/user-payment.dto'

@ApiTags('User Payment')
@Controller('user-payments')
export class UserPaymentController {
  constructor(private readonly paymentService: UserPaymentService) {}

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Get()
  async getUserPayments(
    @Query() query: UserPaymentQueryDto,
  ): Promise<ResponseModel<UserPayment[]>> {
    try {
      const { payments, total } = await this.paymentService.getUserPayments(
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
  @Get('/my')
  async getMyPayments(
    @Request() req: RequestPersonnelModel,
  ): Promise<ResponseModel<UserPayment[]>> {
    try {
      const payments = await this.paymentService.getMyPayments(req.user.id)

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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Get('/summary')
  async getSummary(
    @Query() query: UserPaymentQueryDto,
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

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Post()
  async createUserPayment(
    @Request() req: RequestPersonnelModel,
    @Body() dto: CreateUserPaymentDto,
  ): Promise<ResponseModel<UserPayment>> {
    try {
      const payment = await this.paymentService.createUserPayment(
        req.user.id,
        dto,
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Get('/:id')
  async getUserPaymentById(
    @Param('id') id: string,
  ): Promise<ResponseModel<UserPayment>> {
    try {
      const payment = await this.paymentService.getUserPaymentById(id)

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

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Patch('/:id')
  async updateUserPayment(
    @Request() req: RequestPersonnelModel,
    @Param('id') id: string,
    @Body() dto: UpdateUserPaymentDto,
  ): Promise<ResponseModel<UserPayment>> {
    try {
      const payment = await this.paymentService.updateUserPayment(
        id,
        req.user.id,
        dto,
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

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(
    AuthGuard(['personnelJwt', 'adminJwt']),
    PersonnelOrPaymentAdminGuard,
  )
  @Delete('/:id')
  async deleteUserPayment(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ResponseModel<UserPayment>> {
    try {
      const isAdmin = !!req.user.role
      const payment = await this.paymentService.deleteUserPayment(
        id,
        isAdmin ? undefined : req.user.id,
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Post('/:id/confirm')
  async confirmUserPayment(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ResponseModel<UserPayment>> {
    try {
      const payment = await this.paymentService.confirmUserPayment(
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

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Post('/:id/reject')
  async rejectUserPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
  ): Promise<ResponseModel<UserPayment>> {
    try {
      const payment = await this.paymentService.rejectUserPayment(
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
