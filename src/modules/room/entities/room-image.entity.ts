import { Room } from './room.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity({
  name: `${process.env.ENV}_room_image`,
})
export class RoomImage extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'room_id' })
  roomId: string

  @ManyToOne(() => Room, (room) => room.roomImages)
  @JoinColumn({ name: 'room_id' })
  room: Room

  @Column()
  image: string

  @Column({ type: 'text', nullable: true })
  caption: string

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  takenAt: Date

  @Column({ type: 'uuid', nullable: true })
  uploadedBy: string
}
