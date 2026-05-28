import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { NotUnitUserDocument } from './entities/not-unit-user-document.entity'
import {
  NotUnitUserDocumentCreateDto,
  NotUnitUserDocumentQueryDto,
  NotUnitUserDocumentUpdateDto,
} from './dto/not-unit-user-document.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class NotUnitUserDocumentService {
  private readonly logger = new Logger(NotUnitUserDocumentService.name)
  constructor(
    @InjectRepository(NotUnitUserDocument)
    private readonly repo: Repository<NotUnitUserDocument>,
  ) {}

  async create(dto: NotUnitUserDocumentCreateDto): Promise<NotUnitUserDocument> {
    this.logger.log('create-not-unit-user-document')
    try {
      const entity = this.repo.create({
        ...dto,
        notUnitUser: dto.notUnitUserId
          ? { id: dto.notUnitUserId }
          : undefined,
      })
      return await this.repo.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAll(
    query: NotUnitUserDocumentQueryDto,
  ): Promise<{ data: NotUnitUserDocument[]; total: number }> {
    this.logger.log('get-all-not-unit-user-documents')
    try {
      const { take, skip } = paginationUtil(query)
      const [data, total] = await this.repo.findAndCount({
        where: {
          isDeleted: false,
          ...(query.notUnitUserId && {
            notUnitUser: { id: query.notUnitUserId },
          }),
          ...(query.searchText && { docName: Like(`%${query.searchText}%`) }),
        },
        relations: ['notUnitUser'],
        order: { createdAt: 'DESC' },
        take,
        skip,
      })
      return { data, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getById(id: string): Promise<NotUnitUserDocument> {
    this.logger.log('get-not-unit-user-document-by-id')
    try {
      return await this.repo.findOne({
        where: { id, isDeleted: false },
        relations: ['notUnitUser'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async update({
    id,
    update,
  }: {
    id: string
    update: NotUnitUserDocumentUpdateDto
  }): Promise<NotUnitUserDocument> {
    this.logger.log('update-not-unit-user-document')
    try {
      return await this.repo.save({
        id,
        ...update,
        notUnitUser: update.notUnitUserId
          ? { id: update.notUnitUserId }
          : undefined,
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log('delete-not-unit-user-document')
    try {
      await this.repo.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
