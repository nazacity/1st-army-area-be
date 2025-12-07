import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: `${process.env.ENV}_admin`,
})
export class Admin extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
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
}
