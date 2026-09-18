import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Survey2Question } from './survey2-question.entity'
import { Survey2UserAnswer } from './survey2-user-answer.entity'

@Entity({
  name: `${process.env.ENV}_survey2_question_answer`,
})
export class Survey2QuestionAnswer extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'int', default: 0 })
  index: number

  @Column({ type: 'text', nullable: true })
  answer: string

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string

  @Column({ default: true })
  display: boolean

  // น้ำหนัก/ระดับของตัวเลือก — ใช้เมื่อคำถาม answerType = weight (เช่น ความพึงพอใจ 1-5)
  @Column({ type: 'int', default: 0 })
  weight: number

  @Column({ default: false })
  isOther: boolean

  @Column({ default: false })
  isComment: boolean

  @Column({ type: 'uuid', name: 'question_id' })
  questionId: string

  @ManyToOne(() => Survey2Question, (question) => question.answers)
  @JoinColumn({ name: 'question_id' })
  question: Survey2Question

  @OneToMany(() => Survey2UserAnswer, (userAnswer) => userAnswer.surveyAnswer)
  userAnswers: Survey2UserAnswer[]
}
