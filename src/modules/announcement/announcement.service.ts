import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Announcement } from './entities/announcement.entity'
import { AnnouncementCreateDto } from './dto/announcement.dto'

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name)

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async getAnnouncements(query?: { take?: number; page?: number }): Promise<{
    announcements: Announcement[]
    total: number
  }> {
    try {
      const take = query?.take ? Number(query.take) : 10
      const page = query?.page ? Number(query.page) : 1
      const skip = take === -1 ? undefined : (page - 1) * take

      const [announcements, total] =
        await this.announcementRepository.findAndCount({
          where: { isDeleted: false },
          order: { pin: 'DESC', createdAt: 'DESC' },
          ...(skip !== undefined && { skip, take }),
        })
      return { announcements, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getMyAnnouncements(): Promise<Announcement[]> {
    try {
      return await this.announcementRepository.find({
        where: { isDeleted: false, display: true },
        order: { pin: 'DESC', createdAt: 'DESC' },
        take: 20,
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAnnouncementById(id: string): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id, isDeleted: false },
    })
    if (!announcement) throw new Error('Announcement is not found')
    return announcement
  }

  async createAnnouncement(
    dto: AnnouncementCreateDto,
    adminId: string,
  ): Promise<Announcement> {
    try {
      return await this.announcementRepository.save(
        this.announcementRepository.create({
          ...dto,
          pin: dto.pin ?? 0,
          display: dto.display ?? true,
          createdBy: adminId,
        }),
      )
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateAnnouncement(
    id: string,
    dto: AnnouncementCreateDto,
  ): Promise<Announcement> {
    try {
      const announcement = await this.getAnnouncementById(id)
      return await this.announcementRepository.save({ ...announcement, ...dto })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateDisplay(id: string, display: boolean): Promise<Announcement> {
    const announcement = await this.getAnnouncementById(id)
    return await this.announcementRepository.save({ ...announcement, display })
  }

  async updatePin(id: string, pin: number): Promise<Announcement> {
    const announcement = await this.getAnnouncementById(id)
    return await this.announcementRepository.save({ ...announcement, pin })
  }

  async deleteAnnouncement(id: string): Promise<Announcement> {
    const announcement = await this.getAnnouncementById(id)
    return await this.announcementRepository.save({ ...announcement, isDeleted: true })
  }
}
