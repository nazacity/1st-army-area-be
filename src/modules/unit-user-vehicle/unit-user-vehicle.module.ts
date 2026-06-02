import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UnitUserVehicle } from './entities/unit-user-vehicle.entity'
import { UnitUserVehicleImage } from '../unit-user-vehicle-image/entities/unit-user-vehicle-image.entity'
import { UnitUserVehicleService } from './unit-user-vehicle.service'
import { UnitUserVehicleController } from './unit-user-vehicle.controller'
import { UnitUserModule } from '../unit-user/unit-user.module'
import { UnitUserVehicleImageModule } from '../unit-user-vehicle-image/unit-user-vehicle-image.module'
import { UnitUserVehicleStickerModule } from '../unit-user-vehicle-sticker/unit-user-vehicle-sticker.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitUserVehicle, UnitUserVehicleImage]),
    UnitUserModule,
    UnitUserVehicleImageModule,
    UnitUserVehicleStickerModule,
  ],
  controllers: [UnitUserVehicleController],
  providers: [UnitUserVehicleService],
  exports: [UnitUserVehicleService],
})
export class UnitUserVehicleModule {}
