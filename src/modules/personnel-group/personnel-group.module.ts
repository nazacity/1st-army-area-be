import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Personnel } from '../personnel/entities/personnel.entity'
import { PersonnelGroupService } from './personnel-group.service'
import { PersonnelGroupController } from './personnel-group.controller'
import { PersonnelsGroup } from './entities/personnel-group.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PersonnelsGroup, Personnel])],
  controllers: [PersonnelGroupController],
  providers: [PersonnelGroupService],
  exports: [TypeOrmModule, PersonnelGroupService],
})
export class PersonnelGroupModule {}
