import { Module } from '@nestjs/common'
import { UnitPublicController } from './unit-public.controller'
import { UnitModule } from '../unit/unit.module'
import { BuildingModule } from '../building/building.module'
import { UnitUserModule } from '../unit-user/unit-user.module'
import { NotUnitUserModule } from '../not-unit-user/not-unit-user.module'
import { UnitUserVehicleModule } from '../unit-user-vehicle/unit-user-vehicle.module'

@Module({
  imports: [UnitModule, BuildingModule, UnitUserModule, NotUnitUserModule, UnitUserVehicleModule],
  controllers: [UnitPublicController],
})
export class UnitPublicModule {}
