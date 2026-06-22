import React from 'react'
import { Voltra } from '@use-voltra/ios-server'
import type { LiveActivityVariants } from '@use-voltra/ios-server'

export interface IOrderTrackingState {
  orderId: number
  statusName: string
  statusNameEn?: string
  riderName?: string
  locationName?: string
  timeDeliveryText: string
  activeStep: number
  restaurantImageUrl?: string
}

type DeliveryStatus =
  | 'confirmed'
  | 'preparing'
  | 'waiting'
  | 'delivering'
  | 'completed'

interface StatusConfig {
  stepIndex: number
  color: string
  symbol: string
  shortLabel: string
}

const PRIMARY = '#ec6707'
const PRIMARY_TINT = '#ec670733'
const BG_WHITE = '#FFFFFF'
const BORDER = '#E4E4E7'
const TEXT_DARK = '#1F2937'
const TEXT_BODY = '#4B5563'
const TEXT_MUTED = '#9CA3AF'
const DOT_EMPTY = '#E5E7EB'
const COMPLETED_COLOR = '#00B900'
const ISLAND_TEXT = '#F8FAFC'
const ISLAND_MUTED = '#94A3B8'

const STATUS_CONFIG: Record<DeliveryStatus, StatusConfig> = {
  confirmed: {
    stepIndex: 0,
    color: PRIMARY,
    symbol: 'doc.text.fill',
    shortLabel: 'ยืนยัน',
  },
  preparing: {
    stepIndex: 1,
    color: PRIMARY,
    symbol: 'flame.fill',
    shortLabel: 'เตรียม',
  },
  waiting: {
    stepIndex: 2,
    color: PRIMARY,
    symbol: 'bag.fill',
    shortLabel: 'รอจัดส่ง',
  },
  delivering: {
    stepIndex: 3,
    color: PRIMARY,
    symbol: 'bicycle',
    shortLabel: 'จัดส่ง',
  },
  completed: {
    stepIndex: 4,
    color: COMPLETED_COLOR,
    symbol: 'checkmark.circle.fill',
    shortLabel: 'เสร็จ',
  },
}

const STATUS_LABEL_TH: Record<DeliveryStatus, string> = {
  confirmed: 'ยืนยันออเดอร์',
  preparing: 'กำลังเตรียมอาหาร',
  waiting: 'รอการจัดส่ง',
  delivering: 'กำลังจัดส่ง',
  completed: 'เสร็จสมบูรณ์',
}

const STATUS_ORDER: DeliveryStatus[] = [
  'confirmed',
  'preparing',
  'waiting',
  'delivering',
  'completed',
]

const statusFromStep = (step: number): DeliveryStatus => {
  if (step >= 5) return 'completed'
  if (step === 4) return 'delivering'
  if (step === 3) return 'waiting'
  if (step === 2) return 'preparing'
  return 'confirmed'
}

const restaurantAssetNameFor = (s: IOrderTrackingState): string =>
  s.restaurantImageUrl ? `restaurant-${s.orderId}` : 'rider.png'

const renderLockScreenContent = (s: IOrderTrackingState) => {
  const status = statusFromStep(s.activeStep)
  const isCompleted = status === 'completed'
  const statusColor = isCompleted ? COMPLETED_COLOR : PRIMARY
  const restaurantAssetName = restaurantAssetNameFor(s)

  return (
    <Voltra.View
      style={{
        backgroundColor: BG_WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <Voltra.HStack style={{ alignItems: 'center', gap: 10 }}>
        <Voltra.View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: PRIMARY_TINT,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Voltra.Image
            source={{ assetName: restaurantAssetName }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            resizeMode="cover"
          />
        </Voltra.View>
        <Voltra.VStack style={{ flex: 1, gap: 2 }}>
          <Voltra.HStack style={{ gap: 4, alignItems: 'baseline' }}>
            <Voltra.Text
              style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: '500' }}
            >
              {'ออเดอร์ #'}
            </Voltra.Text>
            <Voltra.Text
              style={{ color: TEXT_DARK, fontSize: 14, fontWeight: '700' }}
            >
              {s.orderId}
            </Voltra.Text>
          </Voltra.HStack>
          <Voltra.Text
            style={{ color: TEXT_BODY, fontSize: 11 }}
            numberOfLines={1}
          >
            {s.locationName ?? ''}
          </Voltra.Text>
        </Voltra.VStack>

        <Voltra.VStack style={{ alignItems: 'flex-end', gap: 1 }}>
          <Voltra.HStack style={{ gap: 6, alignItems: 'center' }}>
            <Voltra.View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusColor,
              }}
            />
            <Voltra.Text
              style={{ color: TEXT_DARK, fontSize: 12, fontWeight: '700' }}
            >
              {STATUS_LABEL_TH[status]}
            </Voltra.Text>
          </Voltra.HStack>
          <Voltra.Text
            style={{ color: TEXT_MUTED, fontSize: 9, fontWeight: '500' }}
          >
            {'ประมาณ'}
          </Voltra.Text>
          <Voltra.Text
            style={{ color: statusColor, fontSize: 14, fontWeight: '700' }}
          >
            {s.timeDeliveryText}
          </Voltra.Text>
        </Voltra.VStack>
      </Voltra.HStack>
    </Voltra.View>
  )
}

const renderIslandExpandedBottom = (s: IOrderTrackingState) => {
  const status = statusFromStep(s.activeStep)
  const isCompleted = status === 'completed'
  const statusColor = isCompleted ? COMPLETED_COLOR : PRIMARY
  const restaurantAssetName = restaurantAssetNameFor(s)

  return (
    <Voltra.View
      style={{
        backgroundColor: BG_WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <Voltra.HStack style={{ alignItems: 'center', gap: 10 }}>
        <Voltra.View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: PRIMARY_TINT,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Voltra.Image
            source={{ assetName: restaurantAssetName }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            resizeMode="cover"
          />
        </Voltra.View>
        <Voltra.VStack style={{ flex: 1, gap: 2 }}>
          <Voltra.HStack style={{ gap: 4, alignItems: 'baseline' }}>
            <Voltra.Text
              style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: '500' }}
            >
              {'ออเดอร์ #'}
            </Voltra.Text>
            <Voltra.Text
              style={{ color: TEXT_DARK, fontSize: 14, fontWeight: '700' }}
            >
              {s.orderId}
            </Voltra.Text>
          </Voltra.HStack>
          <Voltra.Text
            style={{ color: TEXT_BODY, fontSize: 11 }}
            numberOfLines={1}
          >
            {s.locationName ?? ''}
          </Voltra.Text>
        </Voltra.VStack>

        <Voltra.VStack style={{ alignItems: 'flex-end', gap: 1 }}>
          <Voltra.HStack style={{ gap: 6, alignItems: 'center' }}>
            <Voltra.View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusColor,
              }}
            />
            <Voltra.Text
              style={{ color: TEXT_DARK, fontSize: 12, fontWeight: '700' }}
            >
              {STATUS_LABEL_TH[status]}
            </Voltra.Text>
          </Voltra.HStack>
          <Voltra.Text
            style={{ color: TEXT_MUTED, fontSize: 9, fontWeight: '500' }}
          >
            {'ประมาณ'}
          </Voltra.Text>
          <Voltra.Text
            style={{ color: statusColor, fontSize: 14, fontWeight: '700' }}
          >
            {s.timeDeliveryText}
          </Voltra.Text>
        </Voltra.VStack>
      </Voltra.HStack>
    </Voltra.View>
  )
}

const renderSupplementalSmall = (s: IOrderTrackingState) => {
  const status = statusFromStep(s.activeStep)
  const isCompleted = status === 'completed'
  const statusColor = isCompleted ? COMPLETED_COLOR : PRIMARY
  return (
    <Voltra.HStack style={{ alignItems: 'center', gap: 6 }}>
      <Voltra.View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: PRIMARY_TINT,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Voltra.Image
          source={{ assetName: 'rider.png' }}
          style={{ width: 18, height: 18, borderRadius: 9 }}
          resizeMode="cover"
        />
      </Voltra.View>
      <Voltra.Text
        style={{ color: statusColor, fontSize: 12, fontWeight: '700' }}
      >
        {s.timeDeliveryText}
      </Voltra.Text>
    </Voltra.HStack>
  )
}

export const buildOrderTrackingVariants = (
  s: IOrderTrackingState,
): LiveActivityVariants => {
  const status = statusFromStep(s.activeStep)
  const isCompleted = status === 'completed'
  const statusColor = isCompleted ? COMPLETED_COLOR : PRIMARY
  const deepLink = `antdelivery://order_tracking/${s.orderId}`

  return {
    lockScreen: {
      activityBackgroundTint: 'transparent',
      content: renderLockScreenContent(s),
    },
    island: {
      keylineTint: statusColor,
      minimal: (
        <Voltra.Link destination={deepLink}>
          <Voltra.View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: PRIMARY_TINT,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Voltra.Image
              source={{ assetName: 'rider.png' }}
              style={{ width: 18, height: 18, borderRadius: 9 }}
              resizeMode="cover"
            />
          </Voltra.View>
        </Voltra.Link>
      ),
      compact: {
        leading: (
          <Voltra.Link destination={deepLink}>
            <Voltra.View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: PRIMARY_TINT,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Voltra.Image
                source={{ assetName: 'rider.png' }}
                style={{ width: 18, height: 18, borderRadius: 9 }}
                resizeMode="cover"
              />
            </Voltra.View>
          </Voltra.Link>
        ),
        trailing: (
          <Voltra.Link destination={deepLink}>
            <Voltra.Text
              style={{ color: statusColor, fontSize: 13, fontWeight: '700' }}
            >
              {s.timeDeliveryText}
            </Voltra.Text>
          </Voltra.Link>
        ),
      },
      expanded: {
        leading: (
          <Voltra.Link destination={deepLink}>
            <Voltra.View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: PRIMARY_TINT,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Voltra.Image
                source={{ assetName: 'rider.png' }}
                style={{ width: 18, height: 18, borderRadius: 9 }}
                resizeMode="cover"
              />
            </Voltra.View>
          </Voltra.Link>
        ),
        trailing: (
          <Voltra.Link destination={deepLink}>
            <Voltra.Text style={{ color: statusColor, fontWeight: '700' }}>
              {s.timeDeliveryText}
            </Voltra.Text>
          </Voltra.Link>
        ),
        center: (
          <Voltra.Link destination={deepLink}>
            <Voltra.Text
              style={{ color: ISLAND_TEXT, fontSize: 13, fontWeight: '600' }}
              numberOfLines={1}
            >
              {STATUS_LABEL_TH[status]}
            </Voltra.Text>
          </Voltra.Link>
        ),
        bottom: (
          <Voltra.Link destination={deepLink}>
            {renderIslandExpandedBottom(s)}
          </Voltra.Link>
        ),
      },
    },
    supplementalActivityFamilies: {
      small: (
        <Voltra.Link destination={deepLink}>
          {renderSupplementalSmall(s)}
        </Voltra.Link>
      ),
    },
  }
}
