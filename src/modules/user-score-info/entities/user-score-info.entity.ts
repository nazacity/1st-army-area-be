import { UserScoreHistory } from 'src/modules/user-score-history/entities/user-score-history.entity'
import { User } from 'src/modules/user/entities/user.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: `${process.env.ENV}_user_score_info`,
})
export class UserScoreInfo extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User, (user) => user.score, {
    createForeignKeyConstraints: true,
  })
  user: User

  @OneToMany(
    () => UserScoreHistory,
    (userScoreHistory) => userScoreHistory.scoreInfo,
  )
  history: UserScoreHistory[]

  sumDistance?: number
}
