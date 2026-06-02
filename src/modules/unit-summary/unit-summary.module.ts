import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UnitUser } from '../unit-user/entities/unit-user.entity'
import { NotUnitUser } from '../not-unit-user/entities/not-unit-user.entity'
import { UnitUserVehicle } from '../unit-user-vehicle/entities/unit-user-vehicle.entity'
import { Building } from '../building/entities/building.entity'
import { UnitSummaryController } from './unit-summary.controller'
import { UnitSummaryService } from './unit-summary.service'

@Module({
  imports: [TypeOrmModule.forFeature([UnitUser, NotUnitUser, UnitUserVehicle, Building])],
  controllers: [UnitSummaryController],
  providers: [UnitSummaryService],
})
export class UnitSummaryModule {}
