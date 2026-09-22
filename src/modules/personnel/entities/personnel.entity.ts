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
  ARMY = 'ARMY',
  NAVY = 'NAVY',
  AIR_FORCE = 'AIR_FORCE',
  POLICE = 'POLICE',
  MOD = 'MOD', // กลาโหม (สป.)
  JOINT_FORCE = 'JOINT_FORCE', // บก.ทท.
  ROYAL_PAGE_GUARD = 'ROYAL_PAGE_GUARD', // ฉก.ทม.รอ. — ทหารมหาดเล็กราชวัลลภรักษาพระองค์
  FOREIGN = 'FOREIGN', // มิตรประเทศ
}

export const PERSONNEL_TYPE_LABELS: Record<PersonnelType, string> = {
  [PersonnelType.ARMY]: 'ทบ.',
  [PersonnelType.NAVY]: 'ทร.',
  [PersonnelType.AIR_FORCE]: 'ทอ.',
  [PersonnelType.POLICE]: 'ตร.',
  [PersonnelType.MOD]: 'กลาโหม',
  [PersonnelType.JOINT_FORCE]: 'บก.ทท.',
  [PersonnelType.ROYAL_PAGE_GUARD]: 'ทม.รอ.',
  [PersonnelType.FOREIGN]: 'มิตรประเทศ',
}

@Entity({
  name: `${process.env.ENV}_personnel`,
})
export class Personnel extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  username: string

  // nullable: แถวที่ import โดย DOB/บัตรยังไม่ครบ — login ไม่ได้จนกว่าแอดมินจะแก้ + reset password
  @Column({ select: false, nullable: true })
  password: string

  @Column({ default: false })
  isChangePassword: boolean

  @Column({ type: 'varchar', length: 13, unique: true, nullable: true })
  citizenId: string

  // เก็บเวลาเที่ยงวัน Asia/Bangkok กัน timezone shift วันเดือนปีเพี้ยนตอน FE แปลง
  @Column({ type: 'timestamptz', nullable: true })
  dateOfBirth: Date

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
