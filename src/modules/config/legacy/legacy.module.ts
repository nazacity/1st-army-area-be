import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from './configuration'
import { LegacyConfigService } from './legacy.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [ConfigService, LegacyConfigService],
  exports: [ConfigService, LegacyConfigService],
})
export class LegacyConfigModule {}
