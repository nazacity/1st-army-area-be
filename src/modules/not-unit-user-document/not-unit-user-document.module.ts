import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotUnitUserDocument } from './entities/not-unit-user-document.entity'
import { NotUnitUserDocumentService } from './not-unit-user-document.service'
import { NotUnitUserDocumentController } from './not-unit-user-document.controller'
import { NotUnitUserModule } from '../not-unit-user/not-unit-user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([NotUnitUserDocument]),
    NotUnitUserModule,
  ],
  controllers: [NotUnitUserDocumentController],
  providers: [NotUnitUserDocumentService],
  exports: [NotUnitUserDocumentService],
})
export class NotUnitUserDocumentModule {}
