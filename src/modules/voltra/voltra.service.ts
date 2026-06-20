import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { renderLiveActivityToString } from '@use-voltra/ios-server'
import { renderAndroidOngoingNotificationPayloadToJson } from '@use-voltra/android-server'
import { VoltraApnsService } from './voltra.apns.service'
import { VoltraFcmService } from './voltra.fcm.service'
import { VoltraDeviceToken } from './entities/voltra-device-token.entity'
import {
  OrderTrackingStateDto,
  PushOrderTrackingUpdateDto,
  RegisterVoltraTokenDto,
  StopOrderTrackingDto,
} from './dto/voltra.dto'
import { buildOrderTrackingVariants, IOrderTrackingState } from './orderTracking.variants'

export const ORDER_TRACKING_LIVE_ACTIVITY_NAME = 'OrderTracking'

@Injectable()
export class VoltraService {
  private readonly logger = new Logger(VoltraService.name)

  constructor(
    @InjectRepository(VoltraDeviceToken)
    private readonly tokens: Repository<VoltraDeviceToken>,
    private readonly apns: VoltraApnsService,
    private readonly fcm: VoltraFcmService,
  ) {}

  // ==================== Token Registration ====================

  async registerToken(customerId: string, dto: RegisterVoltraTokenDto) {
    // Upsert: same customer + platform + tokenType + orderId → replace token
    const existing = await this.tokens.findOne({
      where: {
        customerId,
        platform: dto.platform,
        tokenType: dto.type,
        orderId: dto.orderId ?? null,
      },
    })

    if (existing) {
      existing.token = dto.token
      existing.isActive = true
      await this.tokens.save(existing)
      return { ok: true, id: existing.id, updated: true }
    }

    const created = this.tokens.create({
      customerId,
      platform: dto.platform,
      tokenType: dto.type,
      token: dto.token,
      orderId: dto.orderId ?? null,
      isActive: true,
    })
    await this.tokens.save(created)
    return { ok: true, id: created.id, updated: false }
  }

  async deactivateTokens(customerId: string, orderId?: number) {
    const where: Record<string, unknown> = { customerId, isActive: true }
    if (orderId !== undefined) where.orderId = orderId
    await this.tokens.update(where, { isActive: false })
    return { ok: true }
  }

  // ==================== Order Tracking Push ====================

  async pushOrderTrackingUpdate(dto: PushOrderTrackingUpdateDto) {
    const state: IOrderTrackingState = {
      orderId: dto.state.orderId,
      statusName: dto.state.statusName,
      statusNameEn: dto.state.statusNameEn,
      riderName: dto.state.riderName,
      timeDeliveryText: dto.state.timeDeliveryText,
      activeStep: dto.state.activeStep,
    }

    const tokens = await this.tokens.find({
      where: {
        customerId: dto.customerId,
        isActive: true,
        ...(dto.orderId !== undefined ? { orderId: dto.orderId } : {}),
      },
    })

    if (tokens.length === 0) {
      throw new NotFoundException('No active Voltra tokens for customer/order')
    }

    const iosTokens = tokens.filter((t) => t.platform === 'ios')
    const androidTokens = tokens.filter((t) => t.platform === 'android')

    const iosResults = await Promise.all(
      iosTokens.map(async (t) => {
        const variants = buildOrderTrackingVariants(state)
        const voltraPayload = await renderLiveActivityToString(variants)
        const contentState = { ...state, voltraPayload }

        if (t.tokenType === 'push-to-start') {
          return this.apns.sendLiveActivityStart({
            pushToStartToken: t.token,
            contentState,
            activityName: ORDER_TRACKING_LIVE_ACTIVITY_NAME,
          })
        }
        return this.apns.sendLiveActivityUpdate({
          pushToken: t.token,
          contentState,
          staleDateSeconds: 3600,
        })
      }),
    )

    const androidResults = await Promise.all(
      androidTokens.map(async (t) => {
        const payload = renderAndroidOngoingNotificationPayloadToJson({
          kind: 'bigText',
          title: `ออเดอร์ #${state.orderId}`,
          text: state.statusName,
          bigText: state.riderName
            ? `คนขับ: ${state.riderName}\nETA: ${state.timeDeliveryText}`
            : `ETA: ${state.timeDeliveryText}`,
          subText: state.timeDeliveryText,
          chronometer: true,
        })
        return this.fcm.sendOngoingNotificationUpdate({
          fcmToken: t.token,
          payload,
          notificationId: 'ant_order_tracking',
        })
      }),
    )

    return {
      ok: true,
      ios: iosResults,
      android: androidResults,
      totalDevices: tokens.length,
    }
  }

  async stopOrderTracking(dto: StopOrderTrackingDto) {
    const tokens = await this.tokens.find({
      where: {
        customerId: dto.customerId,
        isActive: true,
        ...(dto.orderId !== undefined ? { orderId: dto.orderId } : {}),
      },
    })

    const results: Array<{ platform: string; ok: boolean }> = []

    for (const t of tokens) {
      if (t.platform === 'ios' && t.tokenType === 'push-to-update') {
        // End Live Activity via dismissal policy immediate
        const r = await this.apns.sendLiveActivityUpdate({
          pushToken: t.token,
          contentState: { ended: true },
          dismissalPolicy: 'immediate',
        })
        results.push({ platform: 'ios', ok: r.ok })
      } else if (t.platform === 'android') {
        // Android: send stop payload via FCM data, app's bg task calls stopAndroidOngoingNotification
        const r = await this.fcm.sendOngoingNotificationUpdate({
          fcmToken: t.token,
          payload: { v: 1, kind: 'stop' } as unknown as Record<string, unknown>,
          notificationId: 'ant_order_tracking',
        })
        results.push({ platform: 'android', ok: r.ok })
      }
    }

    // Mark tokens inactive
    await this.tokens.update(
      { customerId: dto.customerId, isActive: true, ...(dto.orderId !== undefined ? { orderId: dto.orderId } : {}) },
      { isActive: false },
    )

    return { ok: true, results }
  }

  // ==================== Internal helpers for other modules ====================

  /**
   * Call from your order status change handler / socket service:
   *
   *   await this.voltraService.pushOrderTrackingUpdate({
   *     customerId: order.customer_id,
   *     orderId: order.order_id,
   *     state: { orderId, statusName, activeStep, timeDeliveryText, ... }
   *   });
   */
  mapOrderToState(order: {
    order_id: number
    status_name: string
    status_name_en?: string
    rider_name?: string
    time_delivery_text: string
  }): OrderTrackingStateDto {
    const activeStep = this.deriveActiveStep(order.status_name, order.status_name_en)
    return {
      orderId: order.order_id,
      statusName: order.status_name,
      statusNameEn: order.status_name_en,
      riderName: order.rider_name,
      timeDeliveryText: order.time_delivery_text,
      activeStep,
    }
  }

  private deriveActiveStep(statusTh?: string, statusEn?: string): number {
    const s = `${statusTh || ''} ${statusEn || ''}`.trim()
    if (!s) return 0
    if (s.includes('เสร็จสมบูรณ์') || s.includes('Complete') || s.includes('Success')) return 5
    if (s.includes('จัดส่ง') || s.includes('Deliver')) return 4
    if (s.includes('รอ') || s.includes('Waiting') || s.includes('Ready')) return 3
    if (s.includes('เตรียม') || s.includes('Prepare') || s.includes('Cooking')) return 2
    if (s.includes('ยืนยัน') || s.includes('Confirm') || s.includes('Accept')) return 1
    return 0
  }
}
