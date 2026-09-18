import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Survey2QuestionAnswer } from './survey2-question-answer.entity'
import { Survey2User } from './survey2-user.entity'

@Entity({
  name: `${process.env.ENV}_survey2_user_answer`,
})
export class Survey2UserAnswer extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // ข้อความประกอบ ("อื่นๆ โปรดระบุ" / isComment)
  @Column({ type: 'text', nullable: true })
  answer: string

  @Column({ type: 'uuid', name: 'survey_answer_id' })
  surveyAnswerId: string

  @ManyToOne(
    () => Survey2QuestionAnswer,
    (surveyAnswer) => surveyAnswer.userAnswers,
  )
  @JoinColumn({ name: 'survey_answer_id' })
  surveyAnswer: Survey2QuestionAnswer

  @Column({ type: 'uuid', name: 'personnel_id' })
  personnelId: string

  @Column({ type: 'uuid', name: 'user_survey_id' })
  userSurveyId: string

  @ManyToOne(() => Survey2User, (userSurvey) => userSurvey.userAnswers)
  @JoinColumn({ name: 'user_survey_id' })
  userSurvey: Survey2User
}
