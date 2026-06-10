import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AdminJwtAuthGuard } from 'src/modules/auth/guard/admin-auth.guard'
import { UserScoreHistoryService } from '../user-score-history/user-score-history.service'
import { UserScoreInfoService } from '../user-score-info/user-score-info.service'
import { UserService } from '../user/user.service'
import { ResponseModel } from 'src/model/response.model'
import { SummaryByPublicQueryDto } from './dto/summary.dto'

@ApiTags('Summary')
@Controller('summary')
@ApiBearerAuth('Admin Authorization')
@UseGuards(AdminJwtAuthGuard)
export class SummaryController {
  constructor(
    private readonly userScoreHistoryService: UserScoreHistoryService,
    private readonly userScoreInfoService: UserScoreInfoService,
    private readonly userService: UserService,
  ) {}

  @Get('/all-summary')
  async getUserScoreHistoryByUserScoreId(
    @Query() query: SummaryByPublicQueryDto,
  ): Promise<
    ResponseModel<{
      totalMember: number
      totalDistance: number
      totalTime: number
    }>
  > {
    try {
      const { total } = await this.userService.getUsers({
        page: '1',
        take: '-1',
      })
      const { userScoreHistorys } =
        await this.userScoreHistoryService.getUserScoreHistoriesForSummary({
          ...query,
        })

      return {
        data: {
          totalMember: total,
          totalDistance: userScoreHistorys.reduce((previousValue, item) => {
            return previousValue + item.distance
          }, 0),
          totalTime: userScoreHistorys.reduce((previousValue, item) => {
            return previousValue + item.time
          }, 0),
        },
      }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
