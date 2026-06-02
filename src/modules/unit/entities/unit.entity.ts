import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { UnitUser } from 'src/modules/unit-user/entities/unit-user.entity'
import { BuildingNo } from 'src/modules/building/entities/building-no.entity'

const data = [
  {
    name: 'กองพันทหารสื่อสารที่ 12',
    abbreviationName: 'ส.พัน.12',
  },
  {
    name: 'กองพันทหารม้าที่ 29 รักษาพระองค์',
    abbreviationName: 'ม.พัน.29 รอ.',
  },
  {
    name: 'กองพันทหารม้าที่ 1 รักษาพระองค์',
    abbreviationName: 'ม.พัน.1 พล.ม.2 รอ.',
  },
]

@Entity({
  name: `${process.env.ENV}_unit`,
})
export class Unit extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', default: '' })
  name: string

  @Column({ type: 'text', default: '' })
  abbreviationName: string

  @OneToMany(() => UnitUser, (unitUser) => unitUser.unit)
  unitUsers: UnitUser[]

  @OneToMany(() => BuildingNo, (buildingNo) => buildingNo.unit)
  buildingNos: BuildingNo[]
}
