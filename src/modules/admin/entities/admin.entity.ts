import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Unit } from 'src/modules/unit/entities/unit.entity'

@Entity({
  name: `${process.env.ENV}_admin1`,
})
export class Admin extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  username: string

  @Column()
  password: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  profileImageUrl: string

  @Column()
  phoneNumber: string

  @ManyToMany(() => Unit, (unit) => unit.admins)
  @JoinTable({
    name: `${process.env.ENV}_admin_unit`,
    joinColumn: { name: 'admin_id' },
    inverseJoinColumn: { name: 'unit_id' },
  })
  units: Unit[]
}
