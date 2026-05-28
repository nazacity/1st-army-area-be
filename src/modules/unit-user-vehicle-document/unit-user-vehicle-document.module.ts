import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UnitUserVehicleDocument } from './entities/unit-user-vehicle-document.entity'
import { UnitUserVehicleDocumentService } from './unit-user-vehicle-document.service'
import { UnitUserVehicleDocumentController } from './unit-user-vehicle-document.controller'
import { UnitUserVehicleModule } from '../unit-user-vehicle/unit-user-vehicle.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitUserVehicleDocument]),
    UnitUserVehicleModule,
  ],
  controllers: [UnitUserVehicleDocumentController],
  providers: [UnitUserVehicleDocumentService],
  exports: [UnitUserVehicleDocumentService],
})
export class UnitUserVehicleDocumentModule {}
