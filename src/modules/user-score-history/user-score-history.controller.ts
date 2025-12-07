import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { UserScoreHistoryService } from './user-score-history.service'
import { UserScoreInfoService } from '../user-score-info/user-score-info.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  UserScoreHistoryByUserScoreIdQueryDto,
  UserScoreHistoryCreateDto,
} from './dto/user-score-history.dto'
import { ResponseModel } from 'src/model/response.model'
import { UserScoreHistory } from './entities/user-score-history.entity'
import { UserJwtAuthGuard } from '../auth/guard/user-auth.guard'
import { RequestClinicUserModel } from 'src/model/request.model'

@ApiTags('User Score History')
@Controller('user-score-history')
export class UserScoreHistoryController {
  constructor(
    private readonly userScoreHistoryService: UserScoreHistoryService,
    private readonly userScoreInfoService: UserScoreInfoService,
  ) {}

  @ApiBearerAuth('User Authorization')
  @UseGuards(UserJwtAuthGuard)
  @Get()
  async getUserScoreHistoryByUserScoreId(
    @Request() req: RequestClinicUserModel,
    @Query() query: UserScoreHistoryByUserScoreIdQueryDto,
  ): Promise<ResponseModel<UserScoreHistory[]>> {
    try {
      const { userScoreHistorys, total } =
        await this.userScoreHistoryService.getUserScoreHistoriesByUserScoreId({
          ...query,
          userScoreId: req.user.score.id,
        })

      return {
        meta: { total },
        data: userScoreHistorys,
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

  @Post()
  async createUserScoreHistory(
    @Body() userScoreHistoryCreateDto: UserScoreHistoryCreateDto,
  ): Promise<ResponseModel<UserScoreHistory>> {
    try {
      const scoreInfo = await this.userScoreInfoService.getUserScoreInfoById(
        userScoreHistoryCreateDto.userScoreInfoId,
      )
      const createUser =
        await this.userScoreHistoryService.createUserScoreHistory({
          ...userScoreHistoryCreateDto,
          scoreInfo,
        })

      return { data: createUser }
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
