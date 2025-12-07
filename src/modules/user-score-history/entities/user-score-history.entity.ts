import { UserScoreInfo } from 'src/modules/user-score-info/entities/user-score-info.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: `${process.env.ENV}_user_score_history`,
})
export class UserScoreHistory extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ default: 0 })
  time: number

  @Column({ default: 0 })
  distance: number

  @Column({ default: '' })
  imageUrl: string

  @ManyToOne(() => UserScoreInfo, (userScoreInfo) => userScoreInfo.history, {
    createForeignKeyConstraints: false,
  })
  scoreInfo: UserScoreInfo
}
