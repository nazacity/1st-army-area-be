import { registerAs } from '@nestjs/config'

export default registerAs('legacy', () => ({
  api:
    process.env.LEGACY_API ||
    'https://dev-lcmember-api.azurewebsites.net/auth/login',
}))
