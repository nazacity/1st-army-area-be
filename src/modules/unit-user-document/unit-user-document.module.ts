import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UnitUserDocument } from './entities/unit-user-document.entity'
import { UnitUserDocumentService } from './unit-user-document.service'
import { UnitUserDocumentController } from './unit-user-document.controller'
import { UnitUserModule } from '../unit-user/unit-user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitUserDocument]),
    UnitUserModule,
  ],
  controllers: [UnitUserDocumentController],
  providers: [UnitUserDocumentService],
  exports: [UnitUserDocumentService],
})
export class UnitUserDocumentModule {}
