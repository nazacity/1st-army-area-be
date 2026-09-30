import { Personnel } from 'src/modules/personnel/entities/personnel.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

export enum PersonnelVehicleType {
  CAR = 'CAR', // รถยนต์นั่งส่วนบุคคล
  PICKUP = 'PICKUP', // รถกระบะ
  MOTORCYCLE = 'MOTORCYCLE', // รถจักรยานยนต์
  UNSPECIFIED = 'UNSPECIFIED', // (ไม่ระบุ)
}

export const PERSONNEL_VEHICLE_TYPE_LABELS: Record<PersonnelVehicleType, string> = {
  [PersonnelVehicleType.CAR]: 'รถยนต์นั่งส่วนบุคคล',
  [PersonnelVehicleType.PICKUP]: 'รถกระบะ',
  [PersonnelVehicleType.MOTORCYCLE]: 'รถจักรยานยนต์',
  [PersonnelVehicleType.UNSPECIFIED]: '(ไม่ระบุ)',
}

@Entity({ name: `${process.env.ENV}_personnel_vehicle` })
export class PersonnelVehicle extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // ไม่ unique ระดับ DB — ของจริงซ้ำได้ข้ามคน (คนละจังหวัด) กันซ้ำเฉพาะในคนเดียวกันที่ service
  @Column({ type: 'text' })
  licensePlate: string

  @Column({ type: 'text', nullable: true })
  province: string

  @Column({ type: 'enum', enum: PersonnelVehicleType })
  type: PersonnelVehicleType

  @Column({ type: 'text', nullable: true })
  brand: string

  @Column({ type: 'text', nullable: true })
  model: string

  @Column({ type: 'text', nullable: true })
  color: string

  // เจ้าของตามเล่มทะเบียน — อาจไม่ใช่ นทน. เอง
  @Column({ type: 'text', nullable: true })
  ownerFullName: string

  @Column({ type: 'uuid', name: 'personnel_id' })
  personnelId: string

  @ManyToOne(() => Personnel, (personnel) => personnel.vehicles)
  @JoinColumn({ name: 'personnel_id' })
  personnel: Personnel
}
