import { PersonnelsGroup } from 'src/modules/personnel-group/entities/personnel-group.entity'
import { Room } from 'src/modules/room/entities/room.entity'
import { UserPayment } from 'src/modules/payment/entities/user-payment.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

export enum PersonnelType {
  'ทบ.' = 'ทบ.',
  'ทร.' = 'ทร.',
  'ทอ.' = 'ทอ.',
  'ตร.' = 'ตร.',
  'มิตรประเทศ' = 'มิตรประเทศ',
}

@Entity({
  name: `${process.env.ENV}_personnel`,
})
export class Personnel extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  username: string

  @Column({ select: false })
  password: string

  @Column({ default: false })
  isChangePassword: boolean

  @Column({ type: 'varchar', length: 13, unique: true, nullable: true })
  citizenId: string

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string

  @Column({ type: 'enum', enum: PersonnelType })
  type: PersonnelType

  @Column({ default: 'ไทย' })
  country: string

  @Column({ type: 'text', nullable: true })
  sourceTypeRaw: string

  @Column({ type: 'text', nullable: true })
  branchOfService: string

  @Column({ default: false })
  isSpecialForces: boolean

  @Column({ type: 'text', nullable: true })
  rank: string

  @Column({ type: 'text' })
  firstName: string

  @Column({ type: 'text' })
  lastName: string

  @Column({ type: 'text', nullable: true })
  nickName: string

  @Column({ type: 'text', nullable: true })
  phone: string

  @Column({ type: 'text', nullable: true })
  email: string

  @Column({ type: 'text', unique: true, nullable: true })
  schoolEmail: string

  @Column({ type: 'text', nullable: true })
  lineId: string

  @Column({ type: 'text', unique: true, nullable: true })
  lineUserId: string

  @Column({ type: 'text', nullable: true })
  origin: string

  @Column({ type: 'text', nullable: true })
  preCadetClass: string

  @Column({ type: 'text', nullable: true })
  unitBeforeCourse: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ type: 'text', unique: true, nullable: true })
  militaryId: string

  @Column({ type: 'text', nullable: true })
  maritalStatus: string

  @Column({ type: 'numeric', nullable: true })
  weight: number

  @Column({ type: 'numeric', nullable: true })
  height: number

  @Column({ type: 'text', nullable: true })
  bloodType: string

  @Column({ type: 'text', nullable: true })
  medicalConditions: string

  @Column({ type: 'text', nullable: true })
  remark: string

  @Column({ type: 'text', nullable: true })
  vehicleRegistration: string

  @Column({ type: 'text', nullable: true })
  homeProvince: string

  @Column({ type: 'text', nullable: true })
  profileImage: string

  @Column({ type: 'uuid', nullable: true, name: 'group_id' })
  groupId: string

  @Column({ type: 'uuid', nullable: true, name: 'room_id' })
  roomId: string

  @ManyToOne(() => PersonnelsGroup, (group) => group.personnels)
  @JoinColumn({ name: 'group_id' })
  group: PersonnelsGroup

  @ManyToOne(() => Room, (room) => room.personnels)
  @JoinColumn({ name: 'room_id' })
  room: Room

  @OneToMany(() => UserPayment, (payment) => payment.user)
  payments: UserPayment[]
}
