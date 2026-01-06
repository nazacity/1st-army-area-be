import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserScoreInfo } from './entities/user-score-info.entity'
import { Between, In, Repository } from 'typeorm'
import {
  UserScoreInfoByPublicQueryDto,
  UserScoreInfoByUserQueryDto,
  UserScoreInfoCreateDto,
  UserScoreInfoUpdateDto,
} from './dto/user-score-info.dto'
import { paginationUtil } from 'src/utils/pagination'
import * as _ from 'lodash'
import * as dayjs from 'dayjs'
import { UserScoreHistoryStatus } from '../user-score-history/entities/user-score-history.entity'

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

      const startDate = dayjs()
        .set('month', query.month)
        .set('year', query.year)
        .startOf('month')
        .toDate()
      const endDate = dayjs()
        .set('month', query.month)
        .set('year', query.year)
        .endOf('month')
        .toDate()

      const baseQb = this.userScoreInfoRepository
        .createQueryBuilder('userScoreInfo')
        .leftJoin('userScoreInfo.user', 'u')
        // 👇 เงื่อนไขช่วงวันที่ไปอยู่ใน ON ของ LEFT JOIN แทน
        .leftJoin(
          'userScoreInfo.history',
          'history',
          'history.createdAt BETWEEN :startDate AND :endDate AND history.isDeleted = CAST(:isDeleted AS BOOLEAN) AND history.status IN (:...status)',
          {
            startDate,
            endDate,
            isDeleted: false,
            status: [
              UserScoreHistoryStatus.approved,
              UserScoreHistoryStatus.pending,
            ],
          },
        )
        .select('userScoreInfo.id', 'id')
        .addSelect('COALESCE(SUM(history.distance), 0)', 'sumDistance')
        .where('userScoreInfo.isDeleted = CAST(:isDeleted AS BOOLEAN)', {
          isDeleted: false,
        })

      if (query.base) {
        baseQb.andWhere(
          'u.base = :base AND u.isDeleted = CAST(:isDeleted AS BOOLEAN)',
          { base: query.base, isDeleted: false },
        )
      }

      baseQb.groupBy('userScoreInfo.id')

      // ---------- ดึงทั้งหมด + sort ที่ DB แล้วค่อย slice ----------
      const allRows = await baseQb
        .clone()
        .orderBy('COALESCE(SUM(history.distance), 0)', 'DESC') // sort ตาม sum ของเดือน
        .addOrderBy('userScoreInfo.createdAt', 'DESC')
        .getRawMany<{ id: string; sumDistance: string }>()

      const total = allRows.length

      // paginate ฝั่ง JS
      const rows = allRows.slice(skip, skip + take)
      const ids = rows.map((r) => r.id)

      if (!ids.length) {
        return {
          userScoreInfo: [],
          total,
        }
      }

      const entities = await this.userScoreInfoRepository.find({
        where: {
          id: In(ids),
          isDeleted: false,
          // จะใส่ filter base ซ้ำตรงนี้ก็ได้เพื่อความชัวร์
          user: {
            isDeleted: false,
            ...(query.base && { base: query.base }),
          },
          // history: {
          //   status: In([
          //     UserScoreHistoryStatus.approved,
          //     UserScoreHistoryStatus.pending,
          //   ]),
          //   isDeleted: false,
          // },
        },
        relations: {
          user: true,
          // history: true,
        },
        order: {
          createdAt: 'DESC',
          // history: { createdAt: 'DESC' },
        },
      })

      // map: id -> sumDistance
      const sumMap = rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.id] = Number(row.sumDistance) || 0
        return acc
      }, {})

      // map: id -> entity
      const entityMap = new Map(entities.map((e) => [e.id, e]))

      // ประกอบผลลัพธ์ ตามลำดับ ids (ซึ่ง sort + paginate แล้ว)
      const data = ids
        .map((id) => {
          const entity = entityMap.get(id)
          if (!entity) return null

          // filter history ให้เหลือเฉพาะของเดือนนั้น
          // const filteredHistory = entity.history.filter((h) => {
          //   const created = new Date(h.createdAt)
          //   return (
          //     created >= startDate &&
          //     created <= endDate &&
          //     h.isDeleted === false
          //   )
          // })

          return {
            ...entity,
            // history: filteredHistory, // ถ้าไม่มีในเดือนนี้ → []
            sumDistance: sumMap[id] ?? 0, // ถ้าไม่มี history เลย → 0
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
