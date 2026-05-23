import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { NotUnitUser } from 'src/modules/not-unit-user/entities/not-unit-user.entity'

export enum BuildingStatus {
  'enabled' = 'enabled',
  'repairing' = 'repairing',
  'disabled' = 'disabled',
}

@Entity({
  name: `${process.env.ENV}_build`,
})
export class Build extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  buildNo: string

  @Column({ type: 'int', default: 0 })
  floor: number

  @Column({ type: 'int', default: 0 })
  no: number

  @Column({
    type: 'enum',
    enum: BuildingStatus,
    default: BuildingStatus.enabled,
  })
  status: BuildingStatus

  @OneToMany(() => NotUnitUser, (notUnitUser) => notUnitUser.build)
  relationNotUnitUser: NotUnitUser[]
}
