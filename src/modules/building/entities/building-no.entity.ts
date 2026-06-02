import { GlobalEntity } from 'src/utils/global-entity'
import { Unit } from 'src/modules/unit/entities/unit.entity'
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Building } from './building.entity'

@Entity({
  name: `${process.env.ENV}_building_no`,
})
export class BuildingNo extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  buildNo: string

  @ManyToOne(() => Unit, (unit) => unit.buildingNos)
  unit: Unit

  @OneToMany(() => Building, (building) => building.buildingNo)
  buildings: Building[]
}
