import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Announcement } from './entities/announcement.entity'
import { AnnouncementController } from './announcement.controller'
import { AnnouncementService } from './announcement.service'

@Module({
  imports: [TypeOrmModule.forFeature([Announcement])],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
})
export class AnnouncementModule {}
