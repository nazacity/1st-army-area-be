import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Build } from 'src/modules/build/entities/build.entity'
import { NotUnitUser } from 'src/modules/not-unit-user/entities/not-unit-user.entity'
import { Unit } from 'src/modules/unit/entities/unit.entity'
import { UnitUserVehicle } from 'src/modules/unit-user-vehicle/entities/unit-user-vehicle.entity'

export enum UnitUserGender {
  'male' = 'male',
  'female' = 'female',
}

export enum UnitUserStatus {
  'active' = 'active',
  'disactive' = 'disactive',
}

@Entity({
  name: `${process.env.ENV}_unit_user`,
})
export class UnitUser extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  titleName: string

  @Column({ type: 'text', default: '' })
  firstName: string

  @Column({ type: 'text', default: '' })
  lastName: string

  @Column({
    type: 'enum',
    enum: UnitUserGender,
    default: UnitUserGender.male,
  })
  gender: UnitUserGender

  @Column({ type: 'text', default: '' })
  idCardNo: string

  @Column({ type: 'text', default: '' })
  soliderIdCardNo: string

  @Column({ type: 'date', nullable: true })
  birthDate: Date

  @Column({
    type: 'enum',
    enum: UnitUserStatus,
    default: UnitUserStatus.active,
  })
  status: UnitUserStatus

  @ManyToOne(() => Build, { nullable: true })
  build: Build

  @Column({ type: 'text', default: '' })
  electionLocation: string

  @ManyToOne(() => Unit, (unit) => unit.unitUsers, { nullable: true })
  unit: Unit

  @Column({ type: 'text', default: '' })
  phoneNumber: string

  @Column({ type: 'text', default: '' })
  profileImage: string

  @OneToMany(() => NotUnitUser, (notUnitUser) => notUnitUser.unitUser)
  relationNotUnitUser: NotUnitUser[]

  @OneToMany(() => UnitUserVehicle, (vehicle) => vehicle.relationUnitUser)
  vehicles: UnitUserVehicle[]
}
