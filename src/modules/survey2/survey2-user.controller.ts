import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { RequestPersonnelModel } from 'src/model/request.model'
import { PersonnelJwtAuthGuard } from '../auth/guard/personnel-auth.guard'
import { PersonnelPasswordChangedGuard } from 'src/common/guards/personnel-password-changed.guard'
import { Survey2Service } from './survey2.service'
import { Survey2 } from './entities/survey2.entity'
import { Survey2User } from './entities/survey2-user.entity'
import { Survey2SubmitDto } from './dto/survey2.dto'

@ApiTags('Survey2 User')
@Controller('survey2')
export class Survey2UserController {
  constructor(private readonly survey2Service: Survey2Service) {}

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Get('/user')
  async getLiveSurveys(
    @Request() req: RequestPersonnelModel,
  ): Promise<ResponseModel<Survey2[]>> {
    try {
      const surveys = await this.survey2Service.getLiveSurveys(req.user.id)
      return { data: surveys, meta: { total: surveys.length } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Get('/user/:id')
  async getSurveyForUser(
    @Request() req: RequestPersonnelModel,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Survey2>> {
    try {
      return { data: await this.survey2Service.getSurveyForUser(id, req.user.id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Post('/user')
  async submitSurvey(
    @Request() req: RequestPersonnelModel,
    @Body() dto: Survey2SubmitDto,
  ): Promise<ResponseModel<Survey2User>> {
    try {
      return { data: await this.survey2Service.submitSurvey(req.user.id, dto) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
