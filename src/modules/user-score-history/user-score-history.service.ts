import { Injectable, Logger } from '@nestjs/common'
import { UserScoreHistory } from './entities/user-score-history.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  UserScoreHistoryByUserScoreIdQueryDto,
  UserScoreHistoryCreate,
  UserScoreHistoryCreateDto,
  UserScoreHistoryQueryDto,
  UserScoreHistoryUpdateDto,
} from './dto/user-score-history.dto'
import { paginationUtil } from 'src/utils/pagination'

@Injectable()
export class UserScoreHistoryService {
  private readonly logger = new Logger(UserScoreHistoryService.name)
  constructor(
    @InjectRepository(UserScoreHistory)
    private readonly userScoreHistoryRepository: Repository<UserScoreHistory>,
  ) {}

  async getUserScoreHistories(query: UserScoreHistoryQueryDto): Promise<{
    userScoreHistorys: UserScoreHistory[]
    total: number
  }> {
    this.logger.log('get-user-score-histories')
    try {
      const { take, skip } = paginationUtil(query)

      const [userScoreHistorys, total] =
        await this.userScoreHistoryRepository.findAndCount({
          where: {
            isDeleted: false,
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

  async getUserScoreHistoryById(userId: string): Promise<UserScoreHistory> {
    this.logger.log('get-user-score-history-by-id')
    try {
      const userScoreHistory = await this.userScoreHistoryRepository.findOne({
        where: { id: userId, isDeleted: false },
      })

      return userScoreHistory
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
