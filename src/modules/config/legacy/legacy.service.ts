import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class LegacyConfigService {
  constructor(private configService: ConfigService) {}

  get api(): string {
    return this.configService.get<string>('legacy.api')
  }
}
