import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Room } from './entities/room.entity'
import { RoomImage } from './entities/room-image.entity'
import { Personnel } from '../personnel/entities/personnel.entity'
import {
  CreateRoomDto,
  CreateRoomImageDto,
  RoomQueryDto,
  UpdateRoomDto,
} from './dto/room.dto'

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name)

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomImage)
    private readonly roomImageRepository: Repository<RoomImage>,
  ) {}

  async getRooms(query: RoomQueryDto): Promise<{
    rooms: Room[]
    total: number
  }> {
    try {
      const take = query?.take ? Number(query.take) : -1
      const page = query?.page ? Number(query.page) : 1

      const qb = this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.personnels', 'personnels')
        .where('room.isDeleted = false')

      if (query?.floor) {
        qb.andWhere('room.floor = :floor', { floor: Number(query.floor) })
      }

      qb.orderBy('room.floor', 'ASC').addOrderBy('room.roomNumber', 'ASC')

      let rooms = await qb.getMany()

      if (query?.isEmpty !== undefined) {
        const isEmpty = query.isEmpty === 'true'
        rooms = rooms.filter(
          (room) =>
            isEmpty === !(room.personnels ?? []).some((p) => !p.isDeleted),
        )
      }

      const total = rooms.length
      const skip = take === -1 ? 0 : (page - 1) * take
      rooms = take === -1 ? rooms : rooms.slice(skip, skip + take)

      return { rooms, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getRoomById(id: string): Promise<Room> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['personnels.group', 'roomImages'],
      })

      if (!room) throw new Error('Room is not found')

      return room
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createRoom(dto: CreateRoomDto): Promise<Room> {
    try {
      const existing = await this.roomRepository.findOne({
        where: { roomNumber: dto.roomNumber, isDeleted: false },
      })

      if (existing) throw new Error('Room number is already exist')

      const room = this.roomRepository.create(dto)
      return await this.roomRepository.save(room)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateRoom(id: string, dto: UpdateRoomDto): Promise<Room> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id, isDeleted: false },
      })

      if (!room) throw new Error('Room is not found')

      if (dto.roomNumber && dto.roomNumber !== room.roomNumber) {
        const existing = await this.roomRepository.findOne({
          where: { roomNumber: dto.roomNumber, isDeleted: false },
        })

        if (existing) throw new Error('Room number is already exist')
      }

      return await this.roomRepository.save({ ...room, ...dto })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteRoom(id: string): Promise<Room> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['personnels'],
      })

      if (!room) throw new Error('Room is not found')

      const occupied = (room.personnels ?? []).some((p) => !p.isDeleted)

      if (occupied)
        throw new Error('Room is not empty, move personnel out first')

      room.isDeleted = true
      return await this.roomRepository.save(room)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async seedRooms(): Promise<Room[]> {
    try {
      const existing = await this.roomRepository.find({
        select: { roomNumber: true },
      })
      const existingNumbers = new Set(existing.map((r) => r.roomNumber))

      const rooms: Room[] = []
      for (let floor = 2; floor <= 7; floor++) {
        for (let n = 1; n <= 10; n++) {
          const roomNumber = `${floor}${String(n).padStart(2, '0')}`
          if (existingNumbers.has(roomNumber)) continue

          rooms.push(
            this.roomRepository.create({
              roomNumber,
              floor,
              capacity: 6,
            }),
          )
        }
      }

      return await this.roomRepository.save(rooms)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getRoomPersonnels(id: string): Promise<Personnel[]> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['personnels'],
      })

      if (!room) throw new Error('Room is not found')

      return (room.personnels ?? []).filter((p) => !p.isDeleted)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async assignPersonnel(
    roomId: string,
    personnelId: string,
  ): Promise<Personnel> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: roomId, isDeleted: false },
        relations: ['personnels'],
      })

      if (!room) throw new Error('Room is not found')

      const personnel = await this.roomRepository.manager.findOne(Personnel, {
        where: { id: personnelId, isDeleted: false },
      })

      if (!personnel) throw new Error('Personnel is not found')

      const occupied = (room.personnels ?? []).filter((p) => !p.isDeleted)

      if (occupied.length >= room.capacity) {
        throw new Error('Room is full')
      }

      personnel.roomId = room.id
      return await this.roomRepository.manager.save(Personnel, personnel)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async unassignPersonnel(
    roomId: string,
    personnelId: string,
  ): Promise<Personnel> {
    try {
      const personnel = await this.roomRepository.manager.findOne(Personnel, {
        where: { id: personnelId, isDeleted: false },
      })

      if (!personnel) throw new Error('Personnel is not found')
      if (personnel.roomId !== roomId) {
        throw new Error('Personnel is not in this room')
      }

      personnel.roomId = null
      return await this.roomRepository.manager.save(Personnel, personnel)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getRoomImages(roomId: string): Promise<RoomImage[]> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: roomId, isDeleted: false },
      })

      if (!room) throw new Error('Room is not found')

      return await this.roomImageRepository.find({
        where: { roomId, isDeleted: false },
        order: { takenAt: 'DESC' },
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createRoomImage(
    roomId: string,
    adminId: string,
    dto: CreateRoomImageDto,
  ): Promise<RoomImage> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: roomId, isDeleted: false },
      })

      if (!room) throw new Error('Room is not found')

      const image = this.roomImageRepository.create({
        roomId,
        image: dto.image,
        caption: dto.caption,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
        uploadedBy: adminId,
      })

      return await this.roomImageRepository.save(image)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  // ผู้พักอัปโหลดรูปสภาพห้องเอง — ได้เฉพาะห้องตัวเอง
  async createRoomImageByPersonnel(
    personnelId: string,
    dto: CreateRoomImageDto & { roomId: string },
  ): Promise<RoomImage> {
    try {
      const personnel = await this.roomRepository.manager.findOne(Personnel, {
        where: { id: personnelId, isDeleted: false },
      })

      if (!personnel) throw new Error('Personnel is not found')
      if (personnel.roomId !== dto.roomId) {
        throw new Error('คุณไม่ได้พักในห้องนี้')
      }

      return await this.createRoomImage(dto.roomId, personnelId, dto)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  // ผู้พักลบรูปได้เฉพาะที่ตัวเองอัปโหลด
  async deleteRoomImageByPersonnel(
    personnelId: string,
    imageId: string,
  ): Promise<RoomImage> {
    try {
      const image = await this.roomImageRepository.findOne({
        where: { id: imageId, isDeleted: false },
      })

      if (!image) throw new Error('Room image is not found')
      if (image.uploadedBy !== personnelId) {
        throw new Error('ลบได้เฉพาะรูปที่ตัวเองอัปโหลด')
      }

      image.isDeleted = true
      return await this.roomImageRepository.save(image)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteRoomImage(roomId: string, imageId: string): Promise<RoomImage> {
    try {
      const image = await this.roomImageRepository.findOne({
        where: { id: imageId, roomId, isDeleted: false },
      })

      if (!image) throw new Error('Room image is not found')

      image.isDeleted = true
      return await this.roomImageRepository.save(image)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getMyRoom(personnelId: string): Promise<Room> {
    try {
      const personnel = await this.roomRepository.manager.findOne(Personnel, {
        where: { id: personnelId, isDeleted: false },
        relations: ['room'],
      })

      if (!personnel) throw new Error('Personnel is not found')

      if (!personnel.roomId) {
        return null
      }

      return await this.roomRepository.findOne({
        where: { id: personnel.roomId, isDeleted: false },
        relations: ['personnels', 'roomImages'],
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }
}
