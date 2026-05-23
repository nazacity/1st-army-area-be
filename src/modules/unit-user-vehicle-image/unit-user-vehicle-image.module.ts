import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UnitUserVehicleImage } from './entities/unit-user-vehicle-image.entity'
import { UnitUserVehicleImageService } from './unit-user-vehicle-image.service'
import { UnitUserVehicleImageController } from './unit-user-vehicle-image.controller'

@Module({
  imports: [TypeOrmModule.forFeature([UnitUserVehicleImage])],
  controllers: [UnitUserVehicleImageController],
  providers: [UnitUserVehicleImageService],
  exports: [UnitUserVehicleImageService],
})
export class UnitUserVehicleImageModule {}
