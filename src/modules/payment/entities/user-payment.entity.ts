import { Personnel } from 'src/modules/personnel/entities/personnel.entity'
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
  name: `${process.env.ENV}_user_payment`,
})
export class UserPayment extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string

  @ManyToOne(() => Personnel, (personnel) => personnel.payments)
  @JoinColumn({ name: 'user_id' })
  user: Personnel

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number

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
