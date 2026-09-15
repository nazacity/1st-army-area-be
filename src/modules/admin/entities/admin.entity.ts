import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Unit } from 'src/modules/unit/entities/unit.entity'

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  IT = 'it',
  PERSONNEL = 'personnel',
  BUILDING = 'building',
  EDUCATION = 'education',
}

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

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.PERSONNEL,
  })
  role: AdminRole

  @Column({ default: true })
  isActive: boolean
}
