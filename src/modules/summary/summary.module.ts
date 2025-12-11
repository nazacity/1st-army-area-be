import { Module } from '@nestjs/common'
import { SummaryController } from './summary.controller'
import { UserModule } from '../user/user.module'
import { UserScoreHistoryModule } from '../user-score-history/user-score-history.module'
import { UserScoreInfoModule } from '../user-score-info/user-score-info.module'

@Module({
  imports: [UserModule, UserScoreHistoryModule, UserScoreInfoModule],
  controllers: [SummaryController],
})
export class SummaryModule {}
