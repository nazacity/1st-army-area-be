import { Injectable, Logger } from '@nestjs/common'
import { UserScoreHistory } from './entities/user-score-history.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Like, Repository } from 'typeorm'
import {
  UserScoreHistoryByUserIdQueryDto,
  UserScoreHistoryByUserScoreIdQueryDto,
  UserScoreHistoryCreate,
  UserScoreHistoryCreateDto,
  UserScoreHistoryQueryDto,
  UserScoreHistoryUpdateDto,
} from './dto/user-score-history.dto'
import { paginationUtil } from 'src/utils/pagination'
import * as dayjs from 'dayjs'
import { SummaryByPublicQueryDto } from '../summary/dto/summary.dto'

@Injectable()
export class UserScoreHistoryService {
  private readonly logger = new Logger(UserScoreHistoryService.name)
  constructor(
    @InjectRepository(UserScoreHistory)
    private readonly userScoreHistoryRepository: Repository<UserScoreHistory>,
  ) {}

  async getUserScoreHistories(query: SummaryByPublicQueryDto): Promise<{
    userScoreHistorys: UserScoreHistory[]
    total: number
  }> {
    this.logger.log('get-user-score-histories')
    try {
      const { take, skip } = paginationUtil({ page: '1', take: '-1' })

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

      const [userScoreHistorys, total] =
        await this.userScoreHistoryRepository.findAndCount({
          where: {
            isDeleted: false,
            createdAt: Between(startDate, endDate),
            ...(query.base && {
              scoreInfo: {
                user: {
                  base: query.base,
                },
              },
            }),
          },
          order: {
            createdAt: 'DESC',
          },
          take,
          skip,
        })

      return { userScoreHistorys, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUserScoreHistories2(query: UserScoreHistoryQueryDto): Promise<{
    userScoreHistorys: UserScoreHistory[]
    total: number
  }> {
    this.logger.log('get-user-score-histories')
    try {
      const { take, skip } = paginationUtil(query)

      const startDate = dayjs(query.startDate).startOf('D').toDate()
      const endDate = dayjs(query.endDate).endOf('D').toDate()

      const [userScoreHistorys, total] =
        await this.userScoreHistoryRepository.findAndCount({
          where: [
            {
              isDeleted: false,
              createdAt: Between(startDate, endDate),
              scoreInfo: {
                user: {
                  ...(query.base && {
                    base: query.base,
                  }),
                  ...(query.searchText && {
                    firstName: Like(`%${query.searchText}%`),
                  }),
                },
              },
            },
            {
              isDeleted: false,
              createdAt: Between(startDate, endDate),
              scoreInfo: {
                user: {
                  ...(query.base && {
                    base: query.base,
                  }),
                  ...(query.searchText && {
                    lastName: Like(`%${query.searchText}%`),
                  }),
                },
              },
            },
          ],
          order: {
            createdAt: 'DESC',
          },
          relations: ['scoreInfo.user'],
          take,
          skip,
        })

      return { userScoreHistorys, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUserScoreHistoriesByUserScoreId(
    query: UserScoreHistoryByUserScoreIdQueryDto,
  ): Promise<{
    userScoreHistorys: UserScoreHistory[]
    total: number
  }> {
    this.logger.log('get-user-score-histories-by-user-score-id')
    try {
      const { take, skip } = paginationUtil(query)

      const [userScoreHistorys, total] =
        await this.userScoreHistoryRepository.findAndCount({
          where: {
            isDeleted: false,
            scoreInfo: {
              id: query.userScoreId,
            },
          },
          order: {
            createdAt: 'DESC',
          },
          take,
          skip,
        })

      return { userScoreHistorys, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUserScoreHistoryByUserId(
    query: UserScoreHistoryByUserIdQueryDto,
  ): Promise<{
    userScoreHistorys: UserScoreHistory[]
    total: number
  }> {
    this.logger.log('get-user-score-history-by-user-id')
    try {
      const { take, skip } = paginationUtil(query)

      const [userScoreHistorys, total] =
        await this.userScoreHistoryRepository.findAndCount({
          where: {
            scoreInfo: {
              user: {
                id: query.userId,
              },
            },
            isDeleted: false,
          },
          order: {
            createdAt: 'DESC',
          },
          take,
          skip,
          relations: ['scoreInfo.user'],
        })

      return { userScoreHistorys, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createUserScoreHistory(
    userScoreHistoryCreate: UserScoreHistoryCreate,
  ): Promise<UserScoreHistory> {
    try {
      this.logger.log('create-user-score-history')

      const createdUserScoreHistory =
        await this.userScoreHistoryRepository.create({
          ...userScoreHistoryCreate,
        })

      const savedUserScoreHistory = await this.userScoreHistoryRepository.save(
        createdUserScoreHistory,
      )

      return savedUserScoreHistory
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateUserScoreHistory({
    id,
    userScoreHistoryUpdate,
  }: {
    id: string
    userScoreHistoryUpdate: UserScoreHistoryUpdateDto
  }): Promise<UserScoreHistory> {
    try {
      this.logger.log('update-user-score-history')
      const userScoreHistory = await this.userScoreHistoryRepository.save({
        id,
        ...userScoreHistoryUpdate,
      })
      return userScoreHistory
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteUserScoreHistory({
    userScoreHistoryId,
  }: {
    userScoreHistoryId: string
  }): Promise<boolean> {
    try {
      this.logger.log('delete-user-score-history')
      await this.userScoreHistoryRepository.update(userScoreHistoryId, {
        isDeleted: true,
      })

      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
