import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { AdminJwtAuthGuard } from '../auth/guard/admin-auth.guard'
import { VoltraService } from './voltra.service'
import {
  PushOrderTrackingUpdateDto,
  RegisterVoltraTokenDto,
  StopOrderTrackingDto,
} from './dto/voltra.dto'

/**
 * Voltra order-tracking push API.
 *
 * Flow:
 *   1. App calls POST /api/voltra/register-token after capturing Voltra push token
 *   2. When order status changes (anywhere in backend), call POST /api/voltra/order-tracking/push
 *      or inject VoltraService and call pushOrderTrackingUpdate() directly
 *   3. On order complete/cancel: POST /api/voltra/order-tracking/stop
 *
 * The widget endpoint is served separately (see voltra.widget.controller.ts) because
 * Voltra appends widgetId/platform/family/theme to widget requests, not bearer auth.
 */
@ApiTags('Voltra Order Tracking')
@Controller('voltra')
export class VoltraController {
  constructor(private readonly voltraService: VoltraService) {}

  @Post('/register-token')
  @ApiOperation({ summary: 'Register Voltra push token (app-called)' })
  async registerToken(
    @Body() dto: RegisterVoltraTokenDto,
    @Headers('x-customer-id') customerId: string,
  ): Promise<ResponseModel<{ ok: boolean; id: string; updated: boolean }>> {
    if (!customerId) {
      return { data: { ok: false, id: '', updated: false } }
    }
    const result = await this.voltraService.registerToken(customerId, dto)
    return { data: result }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard)
  @Post('/order-tracking/push')
  @ApiOperation({ summary: 'Push order status update to all devices for a customer (admin/service)' })
  async pushUpdate(
    @Body() dto: PushOrderTrackingUpdateDto,
  ): Promise<ResponseModel<unknown>> {
    const data = await this.voltraService.pushOrderTrackingUpdate(dto)
    return { data }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard)
  @Post('/order-tracking/stop')
  @ApiOperation({ summary: 'Stop all Live Activities / ongoing notifs for a customer order' })
  async stopTracking(
    @Body() dto: StopOrderTrackingDto,
  ): Promise<ResponseModel<unknown>> {
    const data = await this.voltraService.stopOrderTracking(dto)
    return { data }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(AdminJwtAuthGuard)
  @Get('/health')
  @ApiOperation({ summary: 'Voltra service health check' })
  async health(): Promise<ResponseModel<{ ok: boolean; service: string }>> {
    return { data: { ok: true, service: 'voltra' } }
  }
}
