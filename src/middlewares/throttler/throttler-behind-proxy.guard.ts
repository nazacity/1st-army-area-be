import { ThrottlerGuard } from '@nestjs/throttler'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  private readonly logger = new Logger(ThrottlerBehindProxyGuard.name)

  protected getTracker(req: Record<string, any>): Promise<string> {
    const { headers } = req
    const response = headers['x-forwarded-for'] || headers['x-real-ip']
    this.logger.debug(
      'getTracker(): Throttle checking',
      JSON.stringify({
        headers,
        response,
      }),
    )
    return response
  }
}
