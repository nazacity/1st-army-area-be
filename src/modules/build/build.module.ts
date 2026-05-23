import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Build } from './entities/build.entity'
import { BuildService } from './build.service'
import { BuildController } from './build.controller'
import { NotUnitUserModule } from '../not-unit-user/not-unit-user.module'

@Module({
  imports: [TypeOrmModule.forFeature([Build]), NotUnitUserModule],
  controllers: [BuildController],
  providers: [BuildService],
  exports: [BuildService],
})
export class BuildModule {}
