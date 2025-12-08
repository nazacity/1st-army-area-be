import { UserScoreInfo } from 'src/modules/user-score-info/entities/user-score-info.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

export enum UserStatus {
  'active' = 'active',
  'banned' = 'banned',
}

export enum UserGender {
  'male' = 'male',
  'female' = 'female',
}

export enum UserBase {
  'สนง.ผบช.' = 'สนง.ผบช.',
  'กกพ.ทภ.1' = 'กกพ.ทภ.1',
  'กขว.ทภ.1' = 'กขว.ทภ.1',
  'กยก.ทภ.1' = 'กยก.ทภ.1',
  'กกบ.ทภ.1' = 'กกบ.ทภ.1',
  'กกร.ทภ.1' = 'กกร.ทภ.1',
  'ร้อย.บก.ทภ.1' = 'ร้อย.บก.ทภ.1',
  'ร้อย.ปจว.ทภ.1' = 'ร้อย.ปจว.ทภ.1',
}

@Entity({
  name: `${process.env.ENV}_user`,
})
export class User extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  lineId: string

  @Column({ nullable: true, default: '' })
  displayName: string

  @Column({ nullable: true, default: '' })
  profileImageUrl: string

  @Column({ type: 'text', default: '' })
  rank: string

  @Column({ type: 'text', default: '' })
  firstName: string

  @Column({ type: 'text', default: '' })
  lastName: string

  @Column({ type: 'enum', enum: UserGender, default: UserGender.male })
  gender: UserGender

  @Column({ type: 'text', default: '' })
  base: string

  @Column({
    default: UserStatus.active,
    type: 'enum',
    enum: UserStatus,
  })
  status: UserStatus

  @OneToOne(() => UserScoreInfo, (userScoreInfo) => userScoreInfo.user, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn()
  score: UserScoreInfo
}
