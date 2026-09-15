import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PersonnelGroupService } from './personnel-group.service'
import { PersonnelGroupController } from './personnel-group.controller'
import { PersonnelsGroup } from './entities/personnel-group.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PersonnelsGroup])],
  controllers: [PersonnelGroupController],
  providers: [PersonnelGroupService],
  exports: [TypeOrmModule, PersonnelGroupService],
})
export class PersonnelGroupModule {}
