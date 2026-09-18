import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Survey2Part } from './survey2-part.entity'
import { Survey2QuestionAnswer } from './survey2-question-answer.entity'
import { Survey2UserAnswerText } from './survey2-user-answer-text.entity'

export enum Survey2QuestionType {
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  TEXT = 'text',
}

export enum Survey2QuestionAnswerType {
  TEXT = 'text',
  WEIGHT = 'weight',
}

export enum Survey2QuestionCondition {
  MORE_THAN = 'more_than',
  LESS_THAN = 'less_than',
  NOT_FIXED = 'not_fixed',
}

@Entity({
  name: `${process.env.ENV}_survey2_question`,
})
export class Survey2Question extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'int', default: 0 })
  index: number

  @Column({ type: 'text' })
  question: string

  @Column({ type: 'enum', enum: Survey2QuestionType, default: Survey2QuestionType.SELECT })
  type: Survey2QuestionType

  @Column({
    type: 'enum',
    enum: Survey2QuestionAnswerType,
    default: Survey2QuestionAnswerType.TEXT,
  })
  answerType: Survey2QuestionAnswerType

  @Column({
    type: 'enum',
    enum: Survey2QuestionCondition,
    default: Survey2QuestionCondition.NOT_FIXED,
  })
  condition: Survey2QuestionCondition

  @Column({ type: 'int', default: 0 })
  conditionNumber: number

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string

  @Column({ default: true })
  display: boolean

  @Column({ default: false })
  required: boolean

  @Column({ default: false })
  isUserAnswerText: boolean

  @Column({ default: false })
  isHasOther: boolean

  @Column({ type: 'uuid', name: 'part_id' })
  partId: string

  @ManyToOne(() => Survey2Part, (part) => part.questions)
  @JoinColumn({ name: 'part_id' })
  part: Survey2Part

  @OneToMany(() => Survey2QuestionAnswer, (answer) => answer.question)
  answers: Survey2QuestionAnswer[]

  @OneToMany(() => Survey2UserAnswerText, (text) => text.question)
  userAnswerTexts: Survey2UserAnswerText[]

  isAnswered?: boolean
}
