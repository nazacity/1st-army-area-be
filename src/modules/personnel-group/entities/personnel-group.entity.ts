import { Personnel } from 'src/modules/personnel/entities/personnel.entity'
import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity({
  name: `${process.env.ENV}_personnel_group`,
})
export class PersonnelsGroup extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'uuid', nullable: true })
  leaderId: string

  @OneToMany(() => Personnel, (personnel) => personnel.group)
  personnels: Personnel[]
}
