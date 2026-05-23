import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UnitUserVehicle } from 'src/modules/unit-user-vehicle/entities/unit-user-vehicle.entity'

@Entity({
  name: `${process.env.ENV}_unit_user_vehicle_image`,
})
export class UnitUserVehicleImage extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  imageUrl: string

  @ManyToOne(
    () => UnitUserVehicle,
    (vehicle) => vehicle.images,
    { nullable: true },
  )
  vehicle: UnitUserVehicle
}
