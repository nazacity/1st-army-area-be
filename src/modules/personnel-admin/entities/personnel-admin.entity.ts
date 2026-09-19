import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum PersonnelAdminRole {
  SUPER_ADMIN = 'super_admin',
  IT = 'it',
  PERSONNEL = 'personnel',
  BUILDING = 'building',
  EDUCATION = 'education',
}

@Entity({
  name: `${process.env.ENV}_personnel_admin`,
})
export class PersonnelAdmin extends GlobalEntity {
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

  @Column({ nullable: true })
  profileImageUrl: string

  @Column()
  phoneNumber: string

  @Column({
    type: 'enum',
    enum: PersonnelAdminRole,
    default: PersonnelAdminRole.PERSONNEL,
  })
  role: PersonnelAdminRole

  @Column({ default: true })
  isActive: boolean
}
