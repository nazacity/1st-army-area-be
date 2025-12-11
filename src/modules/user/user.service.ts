import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { UserUpdateDto, UserQueryDto, UserCreate } from './dto/user.dto'
import { paginationUtil } from 'src/utils/pagination'

const relations = []

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(query: UserQueryDto): Promise<{
    users: User[]
    total: number
  }> {
    this.logger.log('get-users')
    try {
      const { take, skip } = paginationUtil(query)

      const [users, total] = await this.userRepository.findAndCount({
        where: {
          isDeleted: false,
          ...(query.base && {
            base: query.base,
          }),
        },
        order: {
          createdAt: 'DESC',
        },
        take,
        skip,
      })

      return { users, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUserById(userId: string): Promise<User> {
    this.logger.log('get-user-by-id')
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isDeleted: false },
        relations: ['score'],
      })

      return user
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUserByLineId(lineId: string): Promise<User> {
    this.logger.log('get-user-by-line-id')
    try {
      const user = await this.userRepository.findOne({
        where: { lineId: lineId, isDeleted: false },
        relations: ['score'],
      })

      return user
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createUser(userCreate: UserCreate): Promise<User> {
    try {
      this.logger.log('create-user')

      const createdUser = await this.userRepository.create({
        ...userCreate,
      })

      const savedUser = await this.userRepository.save(createdUser)

      return savedUser
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateUser({
    id,
    userUpdate,
  }: {
    id: string
    userUpdate: UserUpdateDto
  }): Promise<User> {
    try {
      this.logger.log('update-user')
      const user = await this.userRepository.save({
        id,
        ...userUpdate,
      })
      return user
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteUser({ userId }: { userId: string }): Promise<boolean> {
    try {
      this.logger.log('delete-user')
      await this.userRepository.update(userId, {
        isDeleted: true,
      })

      return true
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
