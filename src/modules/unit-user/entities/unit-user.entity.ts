import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Building } from 'src/modules/building/entities/building.entity'
import { Admin } from 'src/modules/admin/entities/admin.entity'
import { NotUnitUser } from 'src/modules/not-unit-user/entities/not-unit-user.entity'
import { Unit } from 'src/modules/unit/entities/unit.entity'
import { UnitUserVehicle } from 'src/modules/unit-user-vehicle/entities/unit-user-vehicle.entity'
import { UnitUserDocument } from 'src/modules/unit-user-document/entities/unit-user-document.entity'

export enum UnitUserGender {
  'male' = 'male',
  'female' = 'female',
}

export enum UnitUserStatus {
  'active' = 'active',
  'disactive' = 'disactive',
}

export enum UnitUserRank {
  'ส.ต.' = 'ส.ต.',
  'ส.ท.' = 'ส.ท.',
  'ส.อ.' = 'ส.อ.',
  'จ.ส.ต.' = 'จ.ส.ต.',
  'จ.ส.ท.' = 'จ.ส.ท.',
  'จ.ส.อ.' = 'จ.ส.อ.',
  'ร.ต.' = 'ร.ต.',
  'ร.ท.' = 'ร.ท.',
  'ร.อ.' = 'ร.อ.',
  'พ.ต.' = 'พ.ต.',
  'พ.ท.' = 'พ.ท.',
  'พ.อ.' = 'พ.อ.',
  'พล.ต.' = 'พล.ต.',
  'พล.ท.' = 'พล.ท.',
  'พล.อ.' = 'พล.อ.',
}

@Entity({
  name: `${process.env.ENV}_unit_user`,
})
export class UnitUser extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'enum', enum: UnitUserRank, default: UnitUserRank['ส.ต.'] })
  rank: UnitUserRank

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

  @OneToOne(() => Building, (building) => building.unitUser, { nullable: true })
  @JoinColumn()
  building: Building

  @Column({ type: 'text', default: '' })
  electionLocation: string

  @ManyToOne(() => Unit, (unit) => unit.unitUsers, { nullable: true })
  unit: Unit

  @Column({ type: 'text', default: '' })
  phoneNumber: string

  @Column({ type: 'text', default: '' })
  profileImage: string

  @Column({ type: 'text', default: '' })
  position: string

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy: Admin

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: Admin

  @OneToMany(() => NotUnitUser, (notUnitUser) => notUnitUser.unitUser)
  relationNotUnitUser: NotUnitUser[]

  @OneToMany(() => UnitUserVehicle, (vehicle) => vehicle.relationUnitUser)
  vehicles: UnitUserVehicle[]

  @OneToMany(() => UnitUserDocument, (doc) => doc.unitUser)
  documents: UnitUserDocument[]
}
