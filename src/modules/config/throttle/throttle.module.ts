import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from './configuration'
import { ThrottleConfigService } from './throttle.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [ConfigService, ThrottleConfigService],
  exports: [ConfigService, ThrottleConfigService]
})
export class ThrottleConfigModule {}
