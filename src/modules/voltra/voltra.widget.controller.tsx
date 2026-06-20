import { Body, Controller, Headers, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { createIOSWidgetUpdateExpressHandler } from '@use-voltra/ios-server'
import { createAndroidWidgetUpdateExpressHandler } from '@use-voltra/android-server'
import { Voltra } from '@use-voltra/ios-server'
import { VoltraAndroid } from '@use-voltra/android'
import { Request } from 'express'
import { VoltraService } from './voltra.service'

/**
 * Voltra appends widgetId, platform, family (iOS), theme, token, headers to every widget request.
 * Return iOS WidgetVariants or AndroidWidgetVariants (per platform).
 *
 * Wire this controller behind the same /api/ prefix as everything else:
 *   iOS:     POST /api/voltra/widget/order   (Voltra adds `family` to body)
 *   Android: POST /api/voltra/widget/order   (Voltra adds `platform: 'android'`)
 */

interface WidgetRenderRequest {
  widgetId: string
  platform: 'ios' | 'android'
  family?: string
  theme?: string
  token?: string
}

const fetchActiveOrder = async (token?: string): Promise<{
  orderId: number
  statusName: string
  timeDeliveryText: string
  activeStep: number
} | null> => {
  if (!token) return null
  // TODO: replace with real DB lookup by bearer token → active order for that customer
  return null
}

@ApiTags('Voltra Widget')
@Controller('voltra/widget')
export class VoltraWidgetController {
  constructor(private readonly voltraService: VoltraService) {}

  @Post('/order')
  async orderWidget(@Body() body: WidgetRenderRequest, @Req() _req: Request) {
    const order = await fetchActiveOrder(body.token)
    if (!order) {
      return null // Voltra treats null as 404 — keeps the cached state
    }

    if (body.platform === 'ios') {
      return {
        systemSmall: (
          <Voltra.VStack spacing={4}>
            <Voltra.Text style={{ color: '#ec6707', fontSize: 13, fontWeight: 'bold' }}>
              {`ออเดอร์ #${order.orderId}`}
            </Voltra.Text>
            <Voltra.Text style={{ color: '#ffffff', fontSize: 15 }}>{order.statusName}</Voltra.Text>
            <Voltra.Text style={{ color: '#8b949e', fontSize: 11 }}>{order.timeDeliveryText}</Voltra.Text>
          </Voltra.VStack>
        ),
        systemMedium: (
          <Voltra.HStack spacing={10}>
            <Voltra.Text style={{ fontSize: 32 }}>{['', '✓', '🍳', '🛵', '📦', '✅'][order.activeStep]}</Voltra.Text>
            <Voltra.VStack spacing={2}>
              <Voltra.Text style={{ color: '#ec6707', fontSize: 13, fontWeight: 'bold' }}>
                {`ออเดอร์ #${order.orderId}`}
              </Voltra.Text>
              <Voltra.Text style={{ color: '#ffffff', fontSize: 15 }}>{order.statusName}</Voltra.Text>
              <Voltra.Text style={{ color: '#8b949e', fontSize: 11 }}>{`ETA ${order.timeDeliveryText}`}</Voltra.Text>
            </Voltra.VStack>
          </Voltra.HStack>
        ),
      }
    }

    // Android
    return [
      {
        size: { width: 180, height: 180 },
        content: (
          <VoltraAndroid.Column>
            <VoltraAndroid.Text style={{ color: '#ec6707', fontSize: 13 }}>{`ออเดอร์ #${order.orderId}`}</VoltraAndroid.Text>
            <VoltraAndroid.Text style={{ color: '#ffffff', fontSize: 15 }}>{order.statusName}</VoltraAndroid.Text>
            <VoltraAndroid.Text style={{ color: '#8b949e', fontSize: 11 }}>{order.timeDeliveryText}</VoltraAndroid.Text>
          </VoltraAndroid.Column>
        ),
      },
    ]
  }
}

// Voltra factory exports — wire to your Express adapter if needed (these are higher-level helpers
// for token validation + auto-response-shaping). The manual controller above is simpler to reason about.
export const iosWidgetHandler = createIOSWidgetUpdateExpressHandler({
  render: async (request) => {
    const order = await fetchActiveOrder(request.token)
    if (!order) return null
    return {
      systemSmall: (
        <Voltra.VStack spacing={4}>
          <Voltra.Text style={{ color: '#ec6707', fontSize: 13, fontWeight: 'bold' }}>
            {`ออเดอร์ #${order.orderId}`}
          </Voltra.Text>
          <Voltra.Text style={{ color: '#ffffff', fontSize: 15 }}>{order.statusName}</Voltra.Text>
        </Voltra.VStack>
      ),
    }
  },
  validateToken: async (token) => !!token,
})

export const androidWidgetHandler = createAndroidWidgetUpdateExpressHandler({
  render: async (request) => {
    const order = await fetchActiveOrder(request.token)
    if (!order) return null
    return [
      {
        size: { width: 180, height: 180 },
        content: (
          <VoltraAndroid.Column>
            <VoltraAndroid.Text style={{ color: '#ffffff', fontSize: 15 }}>{order.statusName}</VoltraAndroid.Text>
          </VoltraAndroid.Column>
        ),
      },
    ]
  },
  validateToken: async (token) => !!token,
})
