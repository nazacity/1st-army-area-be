import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'mysecret',
  accessToken: {
    expired: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRED) || 10800,
  },
  refreshToken: {
    expired: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRED) || 2592000,
  },
}))
