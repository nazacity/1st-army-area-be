import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { PersonnelAdminJwtAuthGuard } from '../auth/guard/personnel-admin-auth.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { PersonnelAdminRole } from '../personnel-admin/entities/personnel-admin.entity'
import { Survey2Service } from './survey2.service'
import { Survey2 } from './entities/survey2.entity'
import { Survey2Part } from './entities/survey2-part.entity'
import { Survey2Question } from './entities/survey2-question.entity'
import { Survey2User } from './entities/survey2-user.entity'
import {
  Survey2CreateDto,
  Survey2DisplayDto,
  Survey2IndexDto,
  Survey2PartCreateDto,
  Survey2PartUpdateDto,
  Survey2QuestionCreateDto,
  Survey2QuestionUpdateDto,
} from './dto/survey2.dto'

@ApiTags('Survey2')
@Controller('survey2')
@UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
@AdminRoles(PersonnelAdminRole.PERSONNEL)
export class Survey2Controller {
  constructor(private readonly survey2Service: Survey2Service) {}

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get()
  async getSurveys(): Promise<ResponseModel<Survey2[]>> {
    try {
      const { surveys, total } = await this.survey2Service.getSurveys()
      return { data: surveys, meta: { total } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get('users')
  async getSurveyUsers(
    @Query('surveyId', ParseUUIDPipe) surveyId: string,
  ): Promise<ResponseModel<Survey2User[]>> {
    try {
      const users = await this.survey2Service.getSurveyUsers(surveyId)
      return { data: users, meta: { total: users.length } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get(':id/results')
  async getSurveyResults(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<any>> {
    try {
      const results = await this.survey2Service.getSurveyResults(id)
      return { data: results }
    } catch (error) {
      throw new HttpException(
        { message: `${error.message} | ${(error.stack ?? '').split('\n').slice(1, 8).join(' ⏎ ')}` },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get(':id')
  async getSurveyById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Survey2>> {
    try {
      return { data: await this.survey2Service.getSurveyById(id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Post()
  async createSurvey(
    @Body() dto: Survey2CreateDto,
  ): Promise<ResponseModel<Survey2>> {
    try {
      return { data: await this.survey2Service.createSurvey(dto) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Patch(':id')
  async updateSurvey(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Survey2CreateDto,
  ): Promise<ResponseModel<Survey2>> {
    try {
      return { data: await this.survey2Service.updateSurvey(id, dto) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Patch(':id/display')
  async updateSurveyDisplay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Survey2DisplayDto,
  ): Promise<ResponseModel<Survey2>> {
    try {
      return { data: await this.survey2Service.updateSurveyDisplay(id, dto.display) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Delete(':id')
  async deleteSurvey(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Survey2>> {
    try {
      return { data: await this.survey2Service.deleteSurvey(id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}

@ApiTags('Survey2 Part')
@Controller('survey2-parts')
@UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
@AdminRoles(PersonnelAdminRole.PERSONNEL)
export class Survey2PartController {
  constructor(private readonly survey2Service: Survey2Service) {}

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get()
  async getParts(
    @Query('surveyId', ParseUUIDPipe) surveyId: string,
  ): Promise<ResponseModel<Survey2Part[]>> {
    try {
      const parts = await this.survey2Service.getParts(surveyId)
      return { data: parts, meta: { total: parts.length } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get(':id')
  async getPartById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Survey2Part>> {
    try {
      return { data: await this.survey2Service.getPartById(id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Post()
  async createPart(
    @Body() dto: Survey2PartCreateDto,
  ): Promise<ResponseModel<Survey2Part>> {
    try {
      return { data: await this.survey2Service.createPart(dto) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Patch(':id')
  async updatePart(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Survey2PartUpdateDto,
  ): Promise<ResponseModel<Survey2Part>> {
    try {
      return { data: await this.survey2Service.updatePart(id, dto.title) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Patch(':id/display')
  async updatePartDisplay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Survey2DisplayDto,
  ): Promise<ResponseModel<Survey2Part>> {
    try {
      return { data: await this.survey2Service.updatePartDisplay(id, dto.display) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Patch(':id/index')
  async updatePartIndex(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Survey2IndexDto,
  ): Promise<ResponseModel<Survey2Part>> {
    try {
      return { data: await this.survey2Service.updatePartIndex(id, dto.index) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Delete(':id')
  async deletePart(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Survey2Part>> {
    try {
      return { data: await this.survey2Service.deletePart(id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}

@ApiTags('Survey2 Question')
@Controller('survey2-questions')
@UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
@AdminRoles(PersonnelAdminRole.PERSONNEL)
export class Survey2QuestionController {
  constructor(private readonly survey2Service: Survey2Service) {}

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get()
  async getQuestions(
    @Query('partId', ParseUUIDPipe) partId: string,
  ): Promise<ResponseModel<Survey2Question[]>> {
    try {
      const questions = await this.survey2Service.getQuestions(partId)
      return { data: questions, meta: { total: questions.length } }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get(':id')
  async getQuestionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Survey2Question>> {
    try {
      return { data: await this.survey2Service.getQuestionById(id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Post()
  async createQuestion(
    @Body() dto: Survey2QuestionCreateDto,
  ): Promise<ResponseModel<Survey2Question>> {
    try {
      return { data: await this.survey2Service.createQuestion(dto) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Patch(':id')
  async updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Survey2QuestionUpdateDto,
  ): Promise<ResponseModel<Survey2Question>> {
    try {
      return { data: await this.survey2Service.updateQuestion(id, dto) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Patch(':id/display')
  async updateQuestionDisplay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Survey2DisplayDto,
  ): Promise<ResponseModel<Survey2Question>> {
    try {
      return { data: await this.survey2Service.updateQuestionDisplay(id, dto.display) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Patch(':id/index')
  async updateQuestionIndex(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Survey2IndexDto,
  ): Promise<ResponseModel<Survey2Question>> {
    try {
      return { data: await this.survey2Service.updateQuestionIndex(id, dto.index) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Delete(':id')
  async deleteQuestion(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseModel<Survey2Question>> {
    try {
      return { data: await this.survey2Service.deleteQuestion(id) }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
