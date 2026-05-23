import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotUnitUser } from './entities/not-unit-user.entity'
import { NotUnitUserService } from './not-unit-user.service'
import { NotUnitUserController } from './not-unit-user.controller'

@Module({
  imports: [TypeOrmModule.forFeature([NotUnitUser])],
  controllers: [NotUnitUserController],
  providers: [NotUnitUserService],
  exports: [NotUnitUserService],
})
export class NotUnitUserModule {}
