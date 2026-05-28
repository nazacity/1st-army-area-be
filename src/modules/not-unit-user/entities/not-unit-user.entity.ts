import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UnitUser } from 'src/modules/unit-user/entities/unit-user.entity'
import { Build } from 'src/modules/build/entities/build.entity'
import { NotUnitUserDocument } from 'src/modules/not-unit-user-document/entities/not-unit-user-document.entity'

export enum NotUnitUserGender {
  'male' = 'male',
  'female' = 'female',
}

export enum NotUnitUserStatus {
  'available' = 'available',
  'unavailable' = 'unavailable',
}

@Entity({
  name: `${process.env.ENV}_not_unit_user`,
})
export class NotUnitUser extends GlobalEntity {
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
    enum: NotUnitUserGender,
    default: NotUnitUserGender.male,
  })
  gender: NotUnitUserGender

  @Column({ type: 'text', default: '' })
  idCardNo: string

  @Column({ type: 'date', nullable: true })
  birthDate: Date

  @Column({ type: 'text', default: '' })
  relationshipToUnitUser: string

  @Column({
    type: 'enum',
    enum: NotUnitUserStatus,
    default: NotUnitUserStatus.available,
  })
  status: NotUnitUserStatus

  @Column({ type: 'text', default: '' })
  electionLocation: string

  @Column({ type: 'text', default: '' })
  phoneNumber: string

  @Column({ type: 'text', default: '' })
  profileImage: string

  @Column({ type: 'text', default: '' })
  career: string

  @ManyToOne(() => UnitUser, (unitUser) => unitUser.relationNotUnitUser, {
    nullable: true,
  })
  unitUser: UnitUser

  @ManyToOne(() => Build, (build) => build.relationNotUnitUser, {
    nullable: true,
  })
  build: Build

  @OneToMany(() => NotUnitUserDocument, (doc) => doc.notUnitUser)
  documents: NotUnitUserDocument[]
}
