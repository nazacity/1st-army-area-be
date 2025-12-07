import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

type TokenType = {
  expired: number
}

@Injectable()
export class JwtConfigService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return this.configService.get<string>('jwt.secret')
  }

  get accessToken(): TokenType {
    return {
      expired: this.configService.get<number>('jwt.accessToken.expired'),
    }
  }

  get refreshToken(): TokenType {
    return {
      expired: this.configService.get<number>('jwt.refreshToken.expired'),
    }
  }
}
