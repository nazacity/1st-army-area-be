import React from 'react'
import { Voltra } from '@use-voltra/ios-server'
import type { LiveActivityVariants } from '@use-voltra/ios-server'

export interface IOrderTrackingState {
  orderId: number
  statusName: string
  statusNameEn?: string
  riderName?: string
  timeDeliveryText: string
  activeStep: number
}

const PRIMARY = '#ec6707'
const WHITE = '#ffffff'
const MUTED = '#8b949e'

const STATUS_EMOJI: Record<number, string> = {
  1: '✓',
  2: '🍳',
  3: '🛵',
  4: '📦',
  5: '✅',
}

export const buildOrderTrackingVariants = (s: IOrderTrackingState): LiveActivityVariants => ({
  lockScreen: {
    content: (
      <Voltra.VStack spacing={8} style={{ width: 320, alignItems: 'flex-start' }}>
        <Voltra.HStack spacing={8}>
          <Voltra.Text style={{ color: PRIMARY, fontSize: 17, fontWeight: 'bold' }}>
            {`ออเดอร์ #${s.orderId}`}
          </Voltra.Text>
          <Voltra.Spacer />
          <Voltra.Text style={{ color: MUTED, fontSize: 13 }}>{s.timeDeliveryText}</Voltra.Text>
        </Voltra.HStack>
        <Voltra.HStack spacing={10}>
          <Voltra.Text style={{ fontSize: 24 }}>{STATUS_EMOJI[s.activeStep]}</Voltra.Text>
          <Voltra.Text style={{ color: WHITE, fontSize: 16, fontWeight: '600' }}>
            {s.statusName}
          </Voltra.Text>
        </Voltra.HStack>
        {s.riderName ? (
          <Voltra.HStack spacing={6}>
            <Voltra.Text style={{ color: MUTED, fontSize: 13 }}>คนขับ:</Voltra.Text>
            <Voltra.Text style={{ color: WHITE, fontSize: 13 }}>{s.riderName}</Voltra.Text>
          </Voltra.HStack>
        ) : null}
      </Voltra.VStack>
    ),
    activityBackgroundTint: '#1c2128',
  },
  island: {
    keylineTint: PRIMARY,
    minimal: (
      <Voltra.Text style={{ color: PRIMARY, fontSize: 13, fontWeight: 'bold' }}>
        {s.timeDeliveryText}
      </Voltra.Text>
    ),
    compact: {
      leading: <Voltra.Text style={{ fontSize: 14 }}>{STATUS_EMOJI[s.activeStep]}</Voltra.Text>,
      trailing: (
        <Voltra.Text style={{ color: PRIMARY, fontSize: 13, fontWeight: '600' }}>
          {s.timeDeliveryText}
        </Voltra.Text>
      ),
    },
    expanded: {
      leading: (
        <Voltra.Text style={{ color: PRIMARY, fontSize: 28, fontWeight: 'bold' }}>
          {STATUS_EMOJI[s.activeStep]}
        </Voltra.Text>
      ),
      trailing: (
        <Voltra.VStack spacing={2} style={{ width: 80, alignItems: 'flex-end' }}>
          <Voltra.Text style={{ color: MUTED, fontSize: 11 }}>ETA</Voltra.Text>
          <Voltra.Text style={{ color: WHITE, fontSize: 15, fontWeight: '600' }}>
            {s.timeDeliveryText}
          </Voltra.Text>
        </Voltra.VStack>
      ),
      center: (
        <Voltra.Text style={{ color: WHITE, fontSize: 15, fontWeight: '600' }}>
          {s.statusName}
        </Voltra.Text>
      ),
      bottom: s.riderName ? (
        <Voltra.Text style={{ color: MUTED, fontSize: 13 }}>{`คนขับ: ${s.riderName}`}</Voltra.Text>
      ) : null,
    },
  },
})
