import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { GlobalEntity } from 'src/utils/global-entity'

export type VoltraPlatform = 'ios' | 'android'
export type VoltraTokenType = 'push-to-update' | 'push-to-start'

/**
 * Stores Voltra push tokens per device/order so backend can push
 * Live Activity updates (iOS APNS) and ongoing-notification updates (Android FCM).
 */
@Entity({
  name: `${process.env.ENV}_voltra_device_token`,
})
@Index('idx_voltra_order', ['orderId'])
@Index('idx_voltra_customer', ['customerId'])
export class VoltraDeviceToken extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  customerId: string

  @Column({ type: 'bigint', nullable: true })
  orderId: number | null

  @Column({ type: 'enum', enum: ['ios', 'android'] })
  platform: VoltraPlatform

  @Column({ type: 'enum', enum: ['push-to-update', 'push-to-start'] })
  tokenType: VoltraTokenType

  @Column()
  token: string

  @Column({ default: true })
  isActive: boolean
}
