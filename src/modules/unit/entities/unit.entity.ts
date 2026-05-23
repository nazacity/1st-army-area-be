import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UnitUser } from 'src/modules/unit-user/entities/unit-user.entity'

@Entity({
  name: `${process.env.ENV}_unit`,
})
export class Unit extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  name: string

  @OneToMany(() => UnitUser, (unitUser) => unitUser.unit)
  unitUsers: UnitUser[]
}
