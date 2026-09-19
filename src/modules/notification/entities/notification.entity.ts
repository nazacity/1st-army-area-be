import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { NotificationRecipient } from './notification-recipient.entity'

export enum NotificationTargetType {
  ALL = 'all',
  GROUP = 'group',
  BRANCH = 'branch',
  USER = 'user',
}

@Entity({ name: `${process.env.ENV}_notification` })
export class Notification extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column({ type: 'text' })
  message: string

  @Column({ type: 'enum', enum: NotificationTargetType })
  targetType: NotificationTargetType

  @Column({ type: 'uuid', nullable: true })
  groupId: string | null

  @Column({ type: 'varchar', nullable: true })
  branch: string | null

  @Column({ nullable: true })
  imageUrl: string

  @Column({ type: 'uuid' })
  createdBy: string

  @OneToMany(() => NotificationRecipient, (r) => r.notification)
  recipients: NotificationRecipient[]
}
