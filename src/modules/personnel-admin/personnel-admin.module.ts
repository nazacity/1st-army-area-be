import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PersonnelAdmin } from './entities/personnel-admin.entity'
import { PersonnelAdminController } from './personnel-admin.controller'
import { PersonnelAdminService } from './personnel-admin.service'

@Module({
  imports: [TypeOrmModule.forFeature([PersonnelAdmin])],
  controllers: [PersonnelAdminController],
  providers: [PersonnelAdminService],
  exports: [PersonnelAdminService],
})
export class PersonnelAdminModule {}
