import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UnitUser } from 'src/modules/unit-user/entities/unit-user.entity'

@Entity({
  name: `${process.env.ENV}_unit_user_document`,
})
export class UnitUserDocument extends GlobalEntity {
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

  @ManyToOne(() => UnitUser, (unitUser) => unitUser.documents, {
    nullable: true,
  })
  unitUser: UnitUser
}
