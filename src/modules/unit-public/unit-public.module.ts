import { Module } from '@nestjs/common'
import { UnitPublicController } from './unit-public.controller'
import { UnitUserModule } from '../unit-user/unit-user.module'
import { NotUnitUserModule } from '../not-unit-user/not-unit-user.module'
import { UnitUserVehicleModule } from '../unit-user-vehicle/unit-user-vehicle.module'

@Module({
  imports: [UnitUserModule, NotUnitUserModule, UnitUserVehicleModule],
  controllers: [UnitPublicController],
})
export class UnitPublicModule {}
