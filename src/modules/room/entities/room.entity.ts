import { Personnel } from 'src/modules/personnel/entities/personnel.entity'
import { RoomImage } from './room-image.entity'
import { RoomPayment } from 'src/modules/payment/entities/room-payment.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity({
  name: `${process.env.ENV}_room`,
})
export class Room extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  roomNumber: string

  @Column({ type: 'int' })
  floor: number

  @Column({ type: 'int', default: 6 })
  capacity: number

  @Column({ type: 'text', nullable: true })
  note: string

  @OneToMany(() => Personnel, (personnel) => personnel.room)
  personnels: Personnel[]

  @OneToMany(() => RoomImage, (roomImage) => roomImage.room)
  roomImages: RoomImage[]

  @OneToMany(() => RoomPayment, (roomPayment) => roomPayment.room)
  roomPayments: RoomPayment[]
}
