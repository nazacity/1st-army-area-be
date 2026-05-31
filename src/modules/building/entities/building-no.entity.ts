import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Building } from './building.entity'

@Entity({
  name: `${process.env.ENV}_building_no`,
})
export class BuildingNo extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  buildNo: string

  @OneToMany(() => Building, (building) => building.buildingNo)
  buildings: Building[]
}
