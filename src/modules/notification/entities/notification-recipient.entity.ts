import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Notification } from './notification.entity'

@Entity({ name: `${process.env.ENV}_notification_recipient` })
export class NotificationRecipient extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'notification_id' })
  notificationId: string

  @ManyToOne(() => Notification, (n) => n.recipients)
  @JoinColumn({ name: 'notification_id' })
  notification: Notification

  @Column({ type: 'uuid', name: 'personnel_id' })
  personnelId: string

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null
}
