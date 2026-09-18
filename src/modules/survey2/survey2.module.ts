import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Survey2Service } from './survey2.service'
import {
  Survey2Controller,
  Survey2PartController,
  Survey2QuestionController,
} from './survey2.controller'
import { Survey2UserController } from './survey2-user.controller'
import { Survey2 } from './entities/survey2.entity'
import { Survey2Part } from './entities/survey2-part.entity'
import { Survey2Question } from './entities/survey2-question.entity'
import { Survey2QuestionAnswer } from './entities/survey2-question-answer.entity'
import { Survey2User } from './entities/survey2-user.entity'
import { Survey2UserAnswer } from './entities/survey2-user-answer.entity'
import { Survey2UserAnswerText } from './entities/survey2-user-answer-text.entity'
import { Personnel } from '../personnel/entities/personnel.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Survey2,
      Survey2Part,
      Survey2Question,
      Survey2QuestionAnswer,
      Survey2User,
      Survey2UserAnswer,
      Survey2UserAnswerText,
      Personnel,
    ]),
  ],
  controllers: [
    // user controller ต้องมาก่อน — กัน GET /survey2/:id (ParseUUIDPipe) กิน path /survey2/user
    Survey2UserController,
    Survey2Controller,
    Survey2PartController,
    Survey2QuestionController,
  ],
  providers: [Survey2Service],
  exports: [Survey2Service],
})
export class Survey2Module {}
