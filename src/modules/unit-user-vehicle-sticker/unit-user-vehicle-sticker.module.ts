import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UnitUserVehicleSticker } from './entities/unit-user-vehicle-sticker.entity'
import { UnitUserVehicleStickerService } from './unit-user-vehicle-sticker.service'
import { UnitUserVehicleStickerController } from './unit-user-vehicle-sticker.controller'

@Module({
  imports: [TypeOrmModule.forFeature([UnitUserVehicleSticker])],
  controllers: [UnitUserVehicleStickerController],
  providers: [UnitUserVehicleStickerService],
  exports: [UnitUserVehicleStickerService],
})
export class UnitUserVehicleStickerModule {}
