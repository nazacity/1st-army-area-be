import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Personnel } from '../personnel/entities/personnel.entity'
import { Notification } from './entities/notification.entity'
import { NotificationRecipient } from './entities/notification-recipient.entity'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationRecipient, Personnel]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
