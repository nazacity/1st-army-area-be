import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PersonnelService } from './personnel.service'
import { PersonnelController } from './personnel.controller'
import { Personnel } from './entities/personnel.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Personnel])],
  controllers: [PersonnelController],
  providers: [PersonnelService],
  exports: [TypeOrmModule, PersonnelService],
})
export class PersonnelModule {}
