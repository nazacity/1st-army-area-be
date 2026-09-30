import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Personnel } from '../personnel/entities/personnel.entity'
import { PersonnelVehicle } from './entities/personnel-vehicle.entity'
import { PersonnelVehicleController } from './personnel-vehicle.controller'
import { PersonnelVehicleService } from './personnel-vehicle.service'

@Module({
  imports: [TypeOrmModule.forFeature([PersonnelVehicle, Personnel])],
  controllers: [PersonnelVehicleController],
  providers: [PersonnelVehicleService],
  exports: [PersonnelVehicleService],
})
export class PersonnelVehicleModule {}
