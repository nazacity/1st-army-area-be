import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SqlConfigService {
  constructor(private configService: ConfigService) {}

  get type(): string {
    return this.configService.get<string>('sql.type')
  }

  get host(): string {
    return this.configService.get<string>('sql.host')
  }

  get port(): number {
    return Number(this.configService.get<number>('sql.port'))
  }

  get username(): string {
    return this.configService.get<string>('sql.username')
  }

  get password(): string {
    return this.configService.get<string>('sql.password')
  }

  get database(): string {
    return this.configService.get<string>('sql.database')
  }

  get synchronize(): boolean {
    return this.configService.get<boolean>('sql.synchronize')
  }

  get logging(): boolean {
    return this.configService.get<boolean>('sql.logging')
  }
}
