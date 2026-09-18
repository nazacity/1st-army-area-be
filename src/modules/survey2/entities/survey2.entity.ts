import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Survey2Part } from './survey2-part.entity'
import { Survey2User } from './survey2-user.entity'

@Entity({
  name: `${process.env.ENV}_survey2`,
})
export class Survey2 extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string

  @Column({ type: 'timestamptz' })
  startDate: Date

  @Column({ type: 'timestamptz' })
  endDate: Date

  @Column({ default: true })
  display: boolean

  @OneToMany(() => Survey2Part, (part) => part.survey)
  parts: Survey2Part[]

  @OneToMany(() => Survey2User, (userSurvey) => userSurvey.survey)
  userSurveys: Survey2User[]

  // virtual — จำนวนคนตอบ (map ที่ service)
  userSurveyTotalNumber?: number
  isAnswered?: boolean
}
