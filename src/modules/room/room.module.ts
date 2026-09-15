import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoomService } from './room.service'
import { RoomController } from './room.controller'
import { Room } from './entities/room.entity'
import { RoomImage } from './entities/room-image.entity'
import { Personnel } from '../personnel/entities/personnel.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomImage, Personnel])],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [TypeOrmModule, RoomService],
})
export class RoomModule {}
