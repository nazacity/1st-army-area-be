import { GlobalEntity } from 'src/utils/global-entity'
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { NotUnitUser } from 'src/modules/not-unit-user/entities/not-unit-user.entity'

@Entity({
  name: `${process.env.ENV}_not_unit_user_document`,
})
export class NotUnitUserDocument extends GlobalEntity {
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

  @ManyToOne(() => NotUnitUser, (notUnitUser) => notUnitUser.documents, {
    nullable: true,
  })
  notUnitUser: NotUnitUser
}
