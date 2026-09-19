import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Personnel } from '../personnel/entities/personnel.entity'
import { Notification, NotificationTargetType } from './entities/notification.entity'
import { NotificationRecipient } from './entities/notification-recipient.entity'
import { NotificationCreateDto } from './dto/notification.dto'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationRecipient)
    private readonly recipientRepository: Repository<NotificationRecipient>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
  ) {}

  // ---------- Admin ----------

  async getNotifications(query?: { take?: number; page?: number }): Promise<{
    notifications: Notification[]
    total: number
  }> {
    const take = query?.take ? Number(query.take) : 10
    const page = query?.page ? Number(query.page) : 1
    const skip = take === -1 ? undefined : (page - 1) * take

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
      ...(skip !== undefined && { skip, take }),
    })
    return { notifications, total }
  }

  async getNotificationWithRecipients(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!notification) throw new Error('Notification is not found')

    const recipients = await this.recipientRepository.find({
      where: { notificationId: id, isDeleted: false },
      relations: ['notification'],
    })
    const personnel = await this.personnelRepository.find({
      where: { id: In(recipients.map((r) => r.personnelId)) },
      select: ['id', 'username', 'rank', 'firstName', 'lastName'],
    })
    const personnelById = new Map(personnel.map((p) => [p.id, p]))

    return {
      notification,
      recipients: recipients.map((r) => ({
        id: r.id,
        readAt: r.readAt,
        personnel: personnelById.get(r.personnelId) ?? null,
      })),
      readCount: recipients.filter((r) => r.readAt).length,
      totalRecipients: recipients.length,
    }
  }

  async createNotification(
    dto: NotificationCreateDto,
    adminId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.save(
      this.notificationRepository.create({
        title: dto.title,
        message: dto.message,
        targetType: dto.targetType,
        groupId: dto.targetType === NotificationTargetType.GROUP ? dto.groupIds?.[0] ?? null : null,
        branch: dto.targetType === NotificationTargetType.BRANCH ? dto.branches?.[0] ?? null : null,
        imageUrl: dto.imageUrl ?? null,
        createdBy: adminId,
      }),
    )

    const personnelIds = await this.resolveRecipients(dto)
    if (personnelIds.length === 0) {
      throw new Error('ไม่พบผู้รับตามเงื่อนไขที่เลือก')
    }

    // bulk insert recipients
    const chunkSize = 500
    for (let i = 0; i < personnelIds.length; i += chunkSize) {
      const chunk = personnelIds.slice(i, i + chunkSize)
      await this.recipientRepository.save(
        chunk.map((personnelId) =>
          this.recipientRepository.create({
            notificationId: notification.id,
            personnelId,
            readAt: null,
          }),
        ),
      )
    }

    return notification
  }

  private async resolveRecipients(dto: NotificationCreateDto): Promise<string[]> {
    const baseWhere = { isDeleted: false }
    switch (dto.targetType) {
      case NotificationTargetType.ALL:
        return (await this.personnelRepository.find({ where: baseWhere, select: { id: true } })).map((p) => p.id)
      case NotificationTargetType.GROUP: {
        if (!dto.groupIds?.length) return []
        return (
          await this.personnelRepository.find({
            where: { ...baseWhere, groupId: In(dto.groupIds) },
            select: { id: true },
          })
        ).map((p) => p.id)
      }
      case NotificationTargetType.BRANCH: {
        if (!dto.branches?.length) return []
        const all = await this.personnelRepository.find({ where: baseWhere, select: ['id', 'branchOfService'] })
        return all.filter((p) => dto.branches!.includes(p.branchOfService ?? '')).map((p) => p.id)
      }
      case NotificationTargetType.USER:
        return dto.userIds ?? []
    }
  }

  async deleteNotification(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!notification) throw new Error('Notification is not found')

    await this.recipientRepository
      .createQueryBuilder()
      .update()
      .set({ isDeleted: true })
      .where('notificationId = :id', { id })
      .execute()

    return await this.notificationRepository.save({ ...notification, isDeleted: true })
  }

  // ---------- User ----------

  async getMyNotifications(personnelId: string): Promise<{
    items: {
      id: string
      title: string
      message: string
      imageUrl: string | null
      createdAt: Date
      readAt: Date | null
    }[]
    unreadCount: number
    total: number
  }> {
    const recipients = await this.recipientRepository.find({
      where: { personnelId, isDeleted: false },
      order: { createdAt: 'DESC' },
      take: 100,
    })
    if (recipients.length === 0) return { items: [], unreadCount: 0, total: 0 }

    const notifications = await this.notificationRepository.find({
      where: { id: In(recipients.map((r) => r.notificationId)), isDeleted: false },
    })
    const byId = new Map(notifications.map((n) => [n.id, n]))

    const items = recipients
      .map((r) => {
        const n = byId.get(r.notificationId)
        if (!n) return null
        return {
          id: r.id,
          notificationId: n.id,
          title: n.title,
          message: n.message,
          imageUrl: n.imageUrl,
          createdAt: r.createdAt,
          readAt: r.readAt,
        }
      })
      .filter(Boolean) as {
      id: string
      notificationId: string
      title: string
      message: string
      imageUrl: string | null
      createdAt: Date
      readAt: Date | null
    }[]

    return {
      items,
      unreadCount: items.filter((i) => !i.readAt).length,
      total: items.length,
    }
  }

  async markRead(recipientId: string, personnelId: string): Promise<void> {
    const recipient = await this.recipientRepository.findOne({
      where: { id: recipientId, personnelId, isDeleted: false },
    })
    if (!recipient) throw new Error('Notification recipient is not found')
    if (!recipient.readAt) {
      await this.recipientRepository.save({ ...recipient, readAt: new Date() })
    }
  }

  async markAllRead(personnelId: string): Promise<void> {
    await this.recipientRepository
      .createQueryBuilder()
      .update()
      .set({ readAt: new Date() })
      .where('personnelId = :personnelId AND readAt IS NULL AND isDeleted = false', {
        personnelId,
      })
      .execute()
  }
}
