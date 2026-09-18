import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Survey2Question } from './survey2-question.entity'
import { Survey2User } from './survey2-user.entity'

@Entity({
  name: `${process.env.ENV}_survey2_user_answer_text`,
})
export class Survey2UserAnswerText extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  answer: string

  @Column({ type: 'uuid', name: 'question_id' })
  questionId: string

  @ManyToOne(() => Survey2Question, (question) => question.userAnswerTexts)
  @JoinColumn({ name: 'question_id' })
  question: Survey2Question

  @Column({ type: 'uuid', name: 'personnel_id' })
  personnelId: string

  @Column({ type: 'uuid', name: 'user_survey_id' })
  userSurveyId: string

  @ManyToOne(() => Survey2User, (userSurvey) => userSurvey.userAnswerTexts)
  @JoinColumn({ name: 'user_survey_id' })
  userSurvey: Survey2User
}
