import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UnitUser } from 'src/modules/unit-user/entities/unit-user.entity'
import { UnitUserVehicleImage } from 'src/modules/unit-user-vehicle-image/entities/unit-user-vehicle-image.entity'
import { UnitUserVehicleSticker } from 'src/modules/unit-user-vehicle-sticker/entities/unit-user-vehicle-sticker.entity'
import { UnitUserVehicleDocument } from 'src/modules/unit-user-vehicle-document/entities/unit-user-vehicle-document.entity'

export enum UnitUserVehicleStatus {
  'active' = 'active',
  'disactive' = 'disactive',
}

@Entity({
  name: `${process.env.ENV}_unit_user_vehicle`,
})
export class UnitUserVehicle extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  licensePlate: string

  @Column({ type: 'text', default: '' })
  brand: string

  @Column({ type: 'text', default: '' })
  type: string

  @Column({ type: 'text', default: '' })
  color: string

  @Column({ type: 'text', default: '' })
  stickerCode: string

  @Column({ type: 'text', default: '' })
  province: string

  @Column({ type: 'text', default: '' })
  ownerFullName: string

  @OneToMany(() => UnitUserVehicleImage, (image) => image.vehicle)
  images: UnitUserVehicleImage[]

  @ManyToOne(() => UnitUser, (unitUser) => unitUser.vehicles, {
    nullable: true,
  })
  relationUnitUser: UnitUser

  @OneToMany(() => UnitUserVehicleSticker, (sticker) => sticker.vehicle)
  stickers: UnitUserVehicleSticker[]

  @OneToMany(() => UnitUserVehicleDocument, (doc) => doc.vehicle)
  documents: UnitUserVehicleDocument[]

  @Column({
    type: 'enum',
    enum: UnitUserVehicleStatus,
    default: UnitUserVehicleStatus.active,
  })
  status: UnitUserVehicleStatus
}
