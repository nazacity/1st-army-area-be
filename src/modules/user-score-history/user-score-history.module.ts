import { Module } from '@nestjs/common'
import { UserScoreHistoryService } from './user-score-history.service'
import { UserScoreHistoryController } from './user-score-history.controller'
import { UserScoreHistory } from './entities/user-score-history.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserScoreInfoModule } from '../user-score-info/user-score-info.module'

@Module({
  imports: [TypeOrmModule.forFeature([UserScoreHistory]), UserScoreInfoModule],
  controllers: [UserScoreHistoryController],
  providers: [UserScoreHistoryService],
  exports: [UserScoreHistoryService],
})
export class UserScoreHistoryModule {}
