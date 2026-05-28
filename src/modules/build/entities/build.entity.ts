import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { NotUnitUser } from 'src/modules/not-unit-user/entities/not-unit-user.entity'
import { UnitUser } from 'src/modules/unit-user/entities/unit-user.entity'
import { Unit } from 'src/modules/unit/entities/unit.entity'

export enum BuildingStatus {
  'enabled' = 'enabled',
  'repairing' = 'repairing',
  'disabled' = 'disabled',
}

export enum BuildingType {
  'เรือนแถว' = 'เรือนแถว',
  'บ้าน' = 'บ้าน',
  'แฟลต' = 'แฟลต',
}

@Entity({
  name: `${process.env.ENV}_build`,
})
export class Build extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  buildNo: string

  @Column({ type: 'enum', enum: BuildingType, default: BuildingType['เรือนแถว'] })
  type: BuildingType

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

  @OneToOne(() => UnitUser, (unitUser) => unitUser.build)
  unitUser: UnitUser

  @ManyToOne(() => Unit, (unit) => unit.unitUsers, { nullable: true })
  unit: Unit
}
