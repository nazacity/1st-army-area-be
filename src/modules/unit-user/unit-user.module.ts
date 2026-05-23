import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UnitUser } from './entities/unit-user.entity'
import { UnitUserService } from './unit-user.service'
import { UnitUserController } from './unit-user.controller'
import { BuildModule } from '../build/build.module'
import { NotUnitUserModule } from '../not-unit-user/not-unit-user.module'
import { UnitModule } from '../unit/unit.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitUser]),
    BuildModule,
    NotUnitUserModule,
    UnitModule,
  ],
  controllers: [UnitUserController],
  providers: [UnitUserService],
  exports: [UnitUserService],
})
export class UnitUserModule {}
