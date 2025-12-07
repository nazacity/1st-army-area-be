import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserScoreInfo } from './entities/user-score-info.entity'
import { Between, In, Repository } from 'typeorm'
import {
  UserScoreInfoByPublicQueryDto,
  UserScoreInfoCreateDto,
  UserScoreInfoUpdateDto,
} from './dto/user-score-info.dto'
import { paginationUtil } from 'src/utils/pagination'
import * as _ from 'lodash'
import { UserScoreHistory } from '../user-score-history/entities/user-score-history.entity'

@Injectable()
export class UserScoreInfoService {
  private readonly logger = new Logger(UserScoreInfoService.name)
  constructor(
    @InjectRepository(UserScoreInfo)
    private readonly userScoreInfoRepository: Repository<UserScoreInfo>,
  ) {}

  async getUserScoreInfoById(userScoreInfoId: string): Promise<UserScoreInfo> {
    this.logger.log('get-user-score-info-by-id')
    try {
      const user = await this.userScoreInfoRepository.findOne({
        where: { id: userScoreInfoId, isDeleted: false },
      })

      return user
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createUserScoreInfo(
    userScoreInfoCreateDto: UserScoreInfoCreateDto,
  ): Promise<UserScoreInfo> {
    try {
      this.logger.log('create-user-score-info')

      const createdUserScoreInfo = await this.userScoreInfoRepository.create(
        userScoreInfoCreateDto,
      )

      const savedUserScoreInfo =
        await this.userScoreInfoRepository.save(createdUserScoreInfo)

      return savedUserScoreInfo
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateUserScoreInfo({
    id,
    userScoreInfoUpdate,
  }: {
    id: string
    userScoreInfoUpdate: UserScoreInfoUpdateDto
  }): Promise<UserScoreInfo> {
    try {
      this.logger.log('update-user-score-info')
      const userScoreInfo = await this.userScoreInfoRepository.save({
        id,
        ...userScoreInfoUpdate,
      })
      return userScoreInfo
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUserScoreInfoByPublic(
    query: UserScoreInfoByPublicQueryDto,
  ): Promise<{
    userScoreInfo: UserScoreInfo[]
    total: number
  }> {
    this.logger.log('get-user-score-info-by-user')
    try {
      const { take, skip } = paginationUtil(query)

      const baseQb = this.userScoreInfoRepository
        .createQueryBuilder('userScoreInfo')
        .leftJoin('userScoreInfo.history', 'history')
        .select('userScoreInfo.id', 'id')
        .addSelect('COALESCE(SUM(history.distance), 0)', 'sumDistance')
        .where('userScoreInfo.isDeleted = CAST(:isDeleted AS BOOLEAN)', {
          isDeleted: false,
        })
        .andWhere('history.createdAt BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        })
        .groupBy('userScoreInfo.id')

      // ดึงทั้งหมดก่อน + เรียงตาม sumDistance ใน DB
      const allRows = await baseQb
        .clone()
        .orderBy('COALESCE(SUM(history.distance), 0)', 'DESC')
        .addOrderBy('userScoreInfo.createdAt', 'DESC')
        .getRawMany<{ id: string; sumDistance: string }>()

      const total = allRows.length

      // paginate ฝั่ง JS แทน
      const rows = allRows.slice(skip, skip + take)

      const ids = rows.map((r) => r.id)

      if (!ids.length) {
        return {
          userScoreInfo: [],
          total,
        }
      }

      // โหลด entity จริง + relations
      const entities = await this.userScoreInfoRepository.find({
        where: {
          id: In(ids),
          isDeleted: false,
          history: {
            createdAt: Between(query.startDate, query.endDate),
          },
        },
        order: {
          createdAt: 'DESC',
          history: { createdAt: 'DESC' },
        },
        relations: {
          user: true,
          history: true,
        },
      })

      // map: id -> sumDistance
      const sumMap = rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.id] = Number(row.sumDistance) || 0
        return acc
      }, {})

      // map: id -> entity
      const entityMap = new Map(entities.map((e) => [e.id, e]))

      // ประกอบผลลัพธ์ตามลำดับ rows (ซึ่ง sort+paginate แล้ว)
      const data = ids
        .map((id) => {
          const entity = entityMap.get(id)
          if (!entity) return null
          return {
            ...entity,
            sumDistance: sumMap[id] ?? 0,
          }
        })
        .filter((v): v is NonNullable<typeof v> => !!v)

      return {
        userScoreInfo: data,
        total,
      }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
