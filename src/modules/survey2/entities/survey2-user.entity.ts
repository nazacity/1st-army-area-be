import { Personnel } from 'src/modules/personnel/entities/personnel.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Survey2 } from './survey2.entity'
import { Survey2UserAnswer } from './survey2-user-answer.entity'
import { Survey2UserAnswerText } from './survey2-user-answer-text.entity'

@Entity({
  name: `${process.env.ENV}_survey2_user`,
})
export class Survey2User extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'survey_id' })
  surveyId: string

  @ManyToOne(() => Survey2, (survey) => survey.userSurveys)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey2

  @Column({ type: 'uuid', name: 'personnel_id' })
  personnelId: string

  @ManyToOne(() => Personnel)
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel

  @OneToMany(() => Survey2UserAnswer, (userAnswer) => userAnswer.userSurvey)
  userAnswers: Survey2UserAnswer[]

  @OneToMany(() => Survey2UserAnswerText, (text) => text.userSurvey)
  userAnswerTexts: Survey2UserAnswerText[]
}
