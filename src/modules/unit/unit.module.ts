import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Unit } from './entities/unit.entity'
import { UnitService } from './unit.service'
import { UnitController } from './unit.controller'
import { UnitUserModule } from '../unit-user/unit-user.module'

@Module({
  imports: [TypeOrmModule.forFeature([Unit]), UnitUserModule],
  controllers: [UnitController],
  providers: [UnitService],
  exports: [UnitService],
})
export class UnitModule {}
