import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RoomPayment } from './entities/room-payment.entity'
import { Personnel } from '../personnel/entities/personnel.entity'
import { PaymentStatus } from './entities/payment-status.enum'
import {
  CreateRoomPaymentDto,
  RoomPaymentQueryDto,
  UpdateRoomPaymentDto,
} from './dto/room-payment.dto'

@Injectable()
export class RoomPaymentService {
  private readonly logger = new Logger(RoomPaymentService.name)

  constructor(
    @InjectRepository(RoomPayment)
    private readonly paymentRepository: Repository<RoomPayment>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  private applyFilters(
    qb: ReturnType<Repository<RoomPayment>['createQueryBuilder']>,
    query: RoomPaymentQueryDto,
  ) {
    qb.where('payment.isDeleted = false')

    if (query?.roomId) {
      qb.andWhere('payment.roomId = :roomId', { roomId: query.roomId })
    }
    if (query?.status) {
      qb.andWhere('payment.status = :status', { status: query.status })
    }
    if (query?.period) {
      qb.andWhere('payment.period = :period', { period: query.period })
    }
    if (query?.from) {
      qb.andWhere('payment.paymentDate >= :from', { from: query.from })
    }
    if (query?.to) {
      qb.andWhere('payment.paymentDate <= :to', { to: query.to })
    }

    return qb
  }

  async getRoomPayments(query: RoomPaymentQueryDto): Promise<{
    payments: RoomPayment[]
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
        .leftJoinAndSelect('payment.room', 'room')
        .leftJoinAndSelect('payment.paidBy', 'paidBy')
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

  async getRoomPaymentsByRoom(roomId: string): Promise<RoomPayment[]> {
    try {
      return await this.paymentRepository.find({
        where: { roomId, isDeleted: false },
        relations: ['room', 'paidBy'],
        order: { createdAt: 'DESC' },
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getMyRoomPayments(personnelId: string): Promise<RoomPayment[]> {
    try {
      const personnel = await this.personnelRepository.findOne({
        where: { id: personnelId, isDeleted: false },
      })

      if (!personnel || !personnel.roomId) {
        return []
      }

      return await this.paymentRepository.find({
        where: { roomId: personnel.roomId, isDeleted: false },
        relations: ['room'],
        order: { createdAt: 'DESC' },
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getRoomPaymentById(id: string): Promise<RoomPayment> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['room', 'paidBy'],
      })

      if (!payment) throw new Error('Payment is not found')

      return payment
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createRoomPayment(dto: CreateRoomPaymentDto): Promise<RoomPayment> {
    try {
      const payment = this.paymentRepository.create({
        ...dto,
        amount: Number(dto.amount),
        status: PaymentStatus.PENDING,
      })

      return await this.paymentRepository.save(payment)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateRoomPayment(
    id: string,
    dto: UpdateRoomPaymentDto,
  ): Promise<RoomPayment> {
    try {
      const payment = await this.getPendingPayment(id)

      return await this.paymentRepository.save({
        ...payment,
        ...dto,
        amount:
          dto.amount !== undefined ? Number(dto.amount) : payment.amount,
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteRoomPayment(id: string): Promise<RoomPayment> {
    try {
      const payment = await this.getRoomPaymentById(id)

      payment.isDeleted = true
      return await this.paymentRepository.save(payment)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async confirmRoomPayment(
    id: string,
    adminId: string,
  ): Promise<RoomPayment> {
    try {
      const payment = await this.getPendingPayment(id)

      payment.status = PaymentStatus.APPROVED
      payment.confirmedBy = adminId
      payment.confirmedAt = new Date()

      return await this.paymentRepository.save(payment)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async rejectRoomPayment(
    id: string,
    adminId: string,
    remark: string,
  ): Promise<RoomPayment> {
    try {
      const payment = await this.getPendingPayment(id)

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

  async getSummary(query: RoomPaymentQueryDto): Promise<
    {
      roomId: string
      roomNumber: string
      approvedTotal: number
      pendingCount: number
      pendingTotal: number
    }[]
  > {
    try {
      const qb = this.applyFilters(
        this.paymentRepository.createQueryBuilder('payment'),
        query,
      )
        .leftJoin('payment.room', 'room')
        .select('payment.roomId', 'roomId')
        .addSelect('room.roomNumber', 'roomNumber')
        .addSelect(
          "SUM(CASE WHEN payment.status = 'approved' THEN payment.amount ELSE 0 END)",
          'approvedTotal',
        )
        .addSelect(
          "COUNT(CASE WHEN payment.status = 'pending' THEN 1 END)",
          'pendingCount',
        )
        .addSelect(
          "SUM(CASE WHEN payment.status = 'pending' THEN payment.amount ELSE 0 END)",
          'pendingTotal',
        )
        .groupBy('payment.roomId')
        .addGroupBy('room.roomNumber')
        .orderBy('room.roomNumber', 'ASC')

      const rows = await qb.getRawMany()

      return rows.map((r) => ({
        roomId: r.roomId,
        roomNumber: r.roomNumber,
        approvedTotal: Number(r.approvedTotal ?? 0),
        pendingCount: Number(r.pendingCount ?? 0),
        pendingTotal: Number(r.pendingTotal ?? 0),
      }))
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  private async getPendingPayment(id: string): Promise<RoomPayment> {
    const payment = await this.getRoomPaymentById(id)

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payment can be modified')
    }

    return payment
  }
}
