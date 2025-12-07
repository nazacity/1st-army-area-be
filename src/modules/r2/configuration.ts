import { registerAs } from '@nestjs/config'

export default registerAs('r2', () => ({
  accessKey: process.env.R2_ACCESS_KEY || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  accoundId: process.env.R2_ACCOUNT_ID || '',
}))
