import { Personnel } from 'src/modules/personnel/entities/personnel.entity'
import { Room } from 'src/modules/room/entities/room.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { PaymentStatus } from './payment-status.enum'

@Entity({
  name: `${process.env.ENV}_room_payment`,
})
export class RoomPayment extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'room_id' })
  roomId: string

  @ManyToOne(() => Room, (room) => room.roomPayments)
  @JoinColumn({ name: 'room_id' })
  room: Room

  @Column({ type: 'uuid', nullable: true, name: 'paid_by_user_id' })
  paidByUserId: string

  @ManyToOne(() => Personnel, { nullable: true })
  @JoinColumn({ name: 'paid_by_user_id' })
  paidBy: Personnel

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number

  @Column({ type: 'text', nullable: true })
  period: string

  @Column({ type: 'date' })
  paymentDate: string

  @Column({ type: 'text', nullable: true })
  slipImage: string

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus

  @Column({ type: 'uuid', nullable: true })
  confirmedBy: string

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt: Date

  @Column({ type: 'text', nullable: true })
  remark: string
}
