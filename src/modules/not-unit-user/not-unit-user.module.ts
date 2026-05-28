import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotUnitUser } from './entities/not-unit-user.entity'
import { NotUnitUserDocument } from 'src/modules/not-unit-user-document/entities/not-unit-user-document.entity'
import { NotUnitUserService } from './not-unit-user.service'
import { NotUnitUserController } from './not-unit-user.controller'

@Module({
  imports: [TypeOrmModule.forFeature([NotUnitUser, NotUnitUserDocument])],
  controllers: [NotUnitUserController],
  providers: [NotUnitUserService],
  exports: [NotUnitUserService],
})
export class NotUnitUserModule {}
