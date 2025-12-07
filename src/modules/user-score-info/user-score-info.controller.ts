import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { UserScoreInfoService } from './user-score-info.service'
import { ApiTags } from '@nestjs/swagger'
import { UserScoreInfoByPublicQueryDto } from './dto/user-score-info.dto'
import { ResponseModel } from 'src/model/response.model'
import { UserScoreInfo } from './entities/user-score-info.entity'

@ApiTags('User Score Info')
@Controller('user-score-info')
export class UserScoreInfoController {
  constructor(private readonly userScoreInfoService: UserScoreInfoService) {}

  @Get()
  async getUserScoreInfoByPublicScoreId(
    @Query() query: UserScoreInfoByPublicQueryDto,
  ): Promise<ResponseModel<UserScoreInfo[]>> {
    try {
      const { userScoreInfo, total } =
        await this.userScoreInfoService.getUserScoreInfoByPublic(query)

      return {
        meta: { total },
        data: userScoreInfo,
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
