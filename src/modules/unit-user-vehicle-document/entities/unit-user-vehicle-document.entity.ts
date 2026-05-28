import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UnitUserVehicle } from 'src/modules/unit-user-vehicle/entities/unit-user-vehicle.entity'

@Entity({
  name: `${process.env.ENV}_unit_user_vehicle_document`,
})
export class UnitUserVehicleDocument extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  docName: string

  @Column({ type: 'text', default: '' })
  docUrl: string

  @Column({ type: 'text', default: '' })
  docType: string

  @Column({ type: 'text', default: '' })
  docSize: string

  @ManyToOne(() => UnitUserVehicle, (vehicle) => vehicle.documents, {
    nullable: true,
  })
  vehicle: UnitUserVehicle
}
