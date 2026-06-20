import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { VoltraController } from './voltra.controller'
import { VoltraWidgetController } from './voltra.widget.controller'
import { VoltraService } from './voltra.service'
import { VoltraApnsService } from './voltra.apns.service'
import { VoltraFcmService } from './voltra.fcm.service'
import { VoltraDeviceToken } from './entities/voltra-device-token.entity'

@Module({
  imports: [TypeOrmModule.forFeature([VoltraDeviceToken]), ConfigModule],
  controllers: [VoltraController, VoltraWidgetController],
  providers: [VoltraService, VoltraApnsService, VoltraFcmService],
  exports: [VoltraService],
})
export class VoltraModule {}
