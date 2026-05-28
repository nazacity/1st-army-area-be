import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { UnitUserDocument } from './entities/unit-user-document.entity'
import {
  UnitUserDocumentCreateDto,
  UnitUserDocumentQueryDto,
  UnitUserDocumentUpdateDto,
} from './dto/unit-user-document.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class UnitUserDocumentService {
  private readonly logger = new Logger(UnitUserDocumentService.name)
  constructor(
    @InjectRepository(UnitUserDocument)
    private readonly repo: Repository<UnitUserDocument>,
  ) {}

  async create(dto: UnitUserDocumentCreateDto): Promise<UnitUserDocument> {
    this.logger.log('create-unit-user-document')
    try {
      const entity = this.repo.create({
        ...dto,
        unitUser: dto.unitUserId ? { id: dto.unitUserId } : undefined,
      })
      return await this.repo.save(entity)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAll(
    query: UnitUserDocumentQueryDto,
  ): Promise<{ data: UnitUserDocument[]; total: number }> {
    this.logger.log('get-all-unit-user-documents')
    try {
      const { take, skip } = paginationUtil(query)
      const [data, total] = await this.repo.findAndCount({
        where: {
          isDeleted: false,
          ...(query.unitUserId && { unitUser: { id: query.unitUserId } }),
          ...(query.searchText && { docName: Like(`%${query.searchText}%`) }),
        },
        relations: ['unitUser'],
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

  async getById(id: string): Promise<UnitUserDocument> {
    this.logger.log('get-unit-user-document-by-id')
    try {
      return await this.repo.findOne({
        where: { id, isDeleted: false },
        relations: ['unitUser'],
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
    update: UnitUserDocumentUpdateDto
  }): Promise<UnitUserDocument> {
    this.logger.log('update-unit-user-document')
    try {
      return await this.repo.save({
        id,
        ...update,
        unitUser: update.unitUserId
          ? { id: update.unitUserId }
          : undefined,
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log('delete-unit-user-document')
    try {
      await this.repo.update(id, { isDeleted: true })
      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
