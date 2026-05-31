import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { NotUnitUser } from 'src/modules/not-unit-user/entities/not-unit-user.entity'
import { UnitUser } from 'src/modules/unit-user/entities/unit-user.entity'
import { Unit } from 'src/modules/unit/entities/unit.entity'
import { BuildingNo } from './building-no.entity'

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
  name: `${process.env.ENV}_building`,
})
@Unique('UQ_building_floor_no', ['buildingNo', 'floor', 'no'])
export class Building extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: BuildingType,
    default: BuildingType['เรือนแถว'],
  })
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

  @ManyToOne(() => BuildingNo, (buildingNo) => buildingNo.buildings, {
    nullable: true,
  })
  buildingNo: BuildingNo

  @OneToMany(() => NotUnitUser, (notUnitUser) => notUnitUser.building)
  relationNotUnitUser: NotUnitUser[]

  @OneToOne(() => UnitUser, (unitUser) => unitUser.building)
  unitUser: UnitUser

  @ManyToOne(() => Unit, (unit) => unit.unitUsers, { nullable: true })
  unit: Unit
}
