import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserPaymentService } from './user-payment.service'
import { UserPaymentController } from './user-payment.controller'
import { RoomPaymentService } from './room-payment.service'
import { RoomPaymentController } from './room-payment.controller'
import { UserPayment } from './entities/user-payment.entity'
import { RoomPayment } from './entities/room-payment.entity'
import { Personnel } from '../personnel/entities/personnel.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPayment, RoomPayment, Personnel]),
  ],
  controllers: [UserPaymentController, RoomPaymentController],
  providers: [UserPaymentService, RoomPaymentService],
  exports: [TypeOrmModule, UserPaymentService, RoomPaymentService],
})
export class PaymentModule {}
