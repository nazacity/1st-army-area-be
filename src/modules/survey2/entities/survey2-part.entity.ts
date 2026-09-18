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
import { Survey2Question } from './survey2-question.entity'

@Entity({
  name: `${process.env.ENV}_survey2_part`,
})
export class Survey2Part extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'int', default: 0 })
  index: number

  @Column({ type: 'text' })
  title: string

  @Column({ default: true })
  display: boolean

  @Column({ type: 'uuid', name: 'survey_id' })
  surveyId: string

  @ManyToOne(() => Survey2, (survey) => survey.parts)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey2

  @OneToMany(() => Survey2Question, (question) => question.part)
  questions: Survey2Question[]
}
