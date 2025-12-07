import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export class GlobalEntity {
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ default: false })
  isDeleted: boolean
}
