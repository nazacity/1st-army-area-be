import { GlobalEntity } from 'src/utils/global-entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum AnnouncementLinkType {
  NONE = 0,
  EXTERNAL = 1,
  INTERNAL = 2,
}

@Entity({ name: `${process.env.ENV}_announcement` })
export class Announcement extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ default: 0 })
  pin: number

  @Column()
  title: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'text', nullable: true })
  subDescription: string

  @Column({ nullable: true })
  thumbnailImgUrl: string

  @Column({ nullable: true })
  linkUrl: string

  @Column({ default: AnnouncementLinkType.NONE })
  linkType: AnnouncementLinkType

  @Column({ default: true })
  display: boolean

  @Column({ type: 'uuid' })
  createdBy: string
}
