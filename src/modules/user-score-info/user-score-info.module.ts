import { Module } from '@nestjs/common'
import { UserScoreInfoService } from './user-score-info.service'
import { UserScoreInfoController } from './user-score-info.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserScoreInfo } from './entities/user-score-info.entity'

@Module({
  imports: [TypeOrmModule.forFeature([UserScoreInfo])],
  controllers: [UserScoreInfoController],
  providers: [UserScoreInfoService],
  exports: [UserScoreInfoService],
})
export class UserScoreInfoModule {}
