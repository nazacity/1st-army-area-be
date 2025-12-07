import { registerAs } from '@nestjs/config'

export default registerAs('throttle', () => ({
  throttleTtl: process.env.THROTTLE_TTL || 100,
  throttleLimit: process.env.THROTTLE_LIMIT || 100,
}))
