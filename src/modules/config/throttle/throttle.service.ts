import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ThrottleConfigService {
  constructor(private configService: ConfigService) {}

  get throttleTtl(): number {
    return Number(this.configService.get<number>('throttle.throttleTtl'))
  }

  get throttleLimit(): number {
    return Number(this.configService.get<number>('throttle.throttleLimit'))
  }
}
