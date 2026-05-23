import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UnitUserVehicle } from 'src/modules/unit-user-vehicle/entities/unit-user-vehicle.entity'

export enum VehicleStickerType {
  'car' = 'car',
  'motorcycle' = 'motorcycle',
}

export enum VehicleStickerRank {
  'nco' = 'nco',
  'officer' = 'officer',
}

@Entity({
  name: `${process.env.ENV}_unit_user_vehicle_sticker`,
})
export class UnitUserVehicleSticker extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  code: string

  @Column({
    type: 'enum',
    enum: VehicleStickerType,
    default: VehicleStickerType.car,
  })
  type: VehicleStickerType

  @Column({
    type: 'enum',
    enum: VehicleStickerRank,
    default: VehicleStickerRank.nco,
  })
  rank: VehicleStickerRank

  @Column({ type: 'date', nullable: true })
  expired: Date

  @OneToOne(() => UnitUserVehicle, (vehicle) => vehicle.sticker)
  vehicle: UnitUserVehicle
}
