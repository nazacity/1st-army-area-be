import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Building } from './entities/building.entity'
import { BuildingNo } from './entities/building-no.entity'
import { Unit } from 'src/modules/unit/entities/unit.entity'
import { BuildingService } from './building.service'
import { BuildingNoService } from './building-no.service'
import { BuildingController } from './building.controller'
import { BuildingNoController } from './building-no.controller'
import { NotUnitUserModule } from '../not-unit-user/not-unit-user.module'

@Module({
  imports: [TypeOrmModule.forFeature([Building, BuildingNo, Unit]), NotUnitUserModule],
  controllers: [BuildingController, BuildingNoController],
  providers: [BuildingService, BuildingNoService],
  exports: [BuildingService, BuildingNoService],
})
export class BuildingModule {}
