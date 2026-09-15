import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserPayment } from './entities/user-payment.entity'
import { PaymentStatus } from './entities/payment-status.enum'
import {
  CreateUserPaymentDto,
  UpdateUserPaymentDto,
  UserPaymentQueryDto,
} from './dto/user-payment.dto'

@Injectable()
export class UserPaymentService {
  private readonly logger = new Logger(UserPaymentService.name)

  constructor(
    @InjectRepository(UserPayment)
    private readonly paymentRepository: Repository<UserPayment>,
  ) {}

  private applyFilters(
    qb: ReturnType<Repository<UserPayment>['createQueryBuilder']>,
    query: UserPaymentQueryDto,
  ) {
    qb.where('payment.isDeleted = false')

    if (query?.userId) {
      qb.andWhere('payment.userId = :userId', { userId: query.userId })
    }
    if (query?.status) {
      qb.andWhere('payment.status = :status', { status: query.status })
    }
    if (query?.from) {
      qb.andWhere('payment.paymentDate >= :from', { from: query.from })
    }
    if (query?.to) {
      qb.andWhere('payment.paymentDate <= :to', { to: query.to })
    }

    return qb
  }

  async getUserPayments(query: UserPaymentQueryDto): Promise<{
    payments: UserPayment[]
    total: number
  }> {
    try {
      const take = query?.take ? Number(query.take) : 10
      const page = query?.page ? Number(query.page) : 1
      const skip = take === -1 ? undefined : (page - 1) * take

      const qb = this.applyFilters(
        this.paymentRepository.createQueryBuilder('payment'),
        query,
      )
        .leftJoinAndSelect('payment.user', 'user')
        .orderBy('payment.createdAt', 'DESC')

      if (skip !== undefined) {
        qb.skip(skip).take(take)
      }

      const [payments, total] = await qb.getManyAndCount()
      return { payments, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getMyPayments(userId: string): Promise<UserPayment[]> {
    try {
      return await this.paymentRepository.find({
        where: { userId, isDeleted: false },
        order: { createdAt: 'DESC' },
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getUserPaymentById(id: string): Promise<UserPayment> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['user'],
      })

      if (!payment) throw new Error('Payment is not found')

      return payment
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createUserPayment(
    userId: string,
    dto: CreateUserPaymentDto,
  ): Promise<UserPayment> {
    try {
      const payment = this.paymentRepository.create({
        ...dto,
        amount: Number(dto.amount),
        userId,
        status: PaymentStatus.PENDING,
      })

      return await this.paymentRepository.save(payment)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateUserPayment(
    id: string,
    userId: string,
    dto: UpdateUserPaymentDto,
  ): Promise<UserPayment> {
    try {
      const payment = await this.getOwnedPendingPayment(id, userId)

      const updated = await this.paymentRepository.save({
        ...payment,
        ...dto,
        amount:
          dto.amount !== undefined ? Number(dto.amount) : payment.amount,
      })

      return updated
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteUserPayment(id: string, userId?: string): Promise<UserPayment> {
    try {
      const payment = userId
        ? await this.getOwnedPendingPayment(id, userId)
        : await this.getUserPaymentById(id)

      payment.isDeleted = true
      return await this.paymentRepository.save(payment)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async confirmUserPayment(id: string, adminId: string): Promise<UserPayment> {
    try {
      const payment = await this.getUserPaymentById(id)

      if (payment.status !== PaymentStatus.PENDING) {
        throw new Error('Payment is already confirmed or rejected')
      }

      payment.status = PaymentStatus.APPROVED
      payment.confirmedBy = adminId
      payment.confirmedAt = new Date()

      return await this.paymentRepository.save(payment)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async rejectUserPayment(
    id: string,
    adminId: string,
    remark: string,
  ): Promise<UserPayment> {
    try {
      const payment = await this.getUserPaymentById(id)

      if (payment.status !== PaymentStatus.PENDING) {
        throw new Error('Payment is already confirmed or rejected')
      }

      payment.status = PaymentStatus.REJECTED
      payment.confirmedBy = adminId
      payment.confirmedAt = new Date()
      payment.remark = remark

      return await this.paymentRepository.save(payment)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getSummary(query: UserPaymentQueryDto): Promise<{
    approvedCount: number
    approvedTotal: number
    pendingCount: number
    pendingTotal: number
    rejectedCount: number
    paidUserCount: number
  }> {
    try {
      const qb = this.applyFilters(
        this.paymentRepository.createQueryBuilder('payment'),
        query,
      )

      const rows = await qb
        .select('payment.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(payment.amount)', 'total')
        .groupBy('payment.status')
        .getRawMany()

      const approved = rows.find((r) => r.status === PaymentStatus.APPROVED)
      const pending = rows.find((r) => r.status === PaymentStatus.PENDING)
      const rejected = rows.find((r) => r.status === PaymentStatus.REJECTED)

      const paidUserQb = this.applyFilters(
        this.paymentRepository.createQueryBuilder('payment'),
        query,
      )

      const paidUserCount = await paidUserQb
        .select('COUNT(DISTINCT payment.userId)', 'count')
        .andWhere('payment.status = :status', { status: PaymentStatus.APPROVED })
        .getRawOne()

      return {
        approvedCount: Number(approved?.count ?? 0),
        approvedTotal: Number(approved?.total ?? 0),
        pendingCount: Number(pending?.count ?? 0),
        pendingTotal: Number(pending?.total ?? 0),
        rejectedCount: Number(rejected?.count ?? 0),
        paidUserCount: Number(paidUserCount?.count ?? 0),
      }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  private async getOwnedPendingPayment(
    id: string,
    userId: string,
  ): Promise<UserPayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, userId, isDeleted: false },
    })

    if (!payment) throw new Error('Payment is not found')
    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payment can be modified')
    }

    return payment
  }
}
