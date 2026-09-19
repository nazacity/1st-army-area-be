import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { RequestPersonnelModel } from 'src/model/request.model'
import { PersonnelAdminJwtAuthGuard } from '../auth/guard/personnel-admin-auth.guard'
import { PersonnelJwtAuthGuard } from '../auth/guard/personnel-auth.guard'
import { PersonnelPasswordChangedGuard } from 'src/common/guards/personnel-password-changed.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { PersonnelAdminRole } from '../personnel-admin/entities/personnel-admin.entity'
import { RoomService } from './room.service'
import { Room } from './entities/room.entity'
import { RoomImage } from './entities/room-image.entity'
import { Personnel } from '../personnel/entities/personnel.entity'
import {
  CreateRoomDto,
  CreateRoomImageDto,
  RoomQueryDto,
  UpdateRoomDto,
} from './dto/room.dto'

@ApiTags('Room')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get()
  async getRooms(
    @Query() query: RoomQueryDto,
  ): Promise<ResponseModel<Room[]>> {
    try {
      const { rooms, total } = await this.roomService.getRooms(query)

      return { data: rooms, meta: { total } }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Get('/my')
  async getMyRoom(
    @Request() req: RequestPersonnelModel,
  ): Promise<ResponseModel<Room>> {
    try {
      const room = await this.roomService.getMyRoom(req.user.id)

      return { data: room }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Post('/my/images')
  async createMyRoomImage(
    @Request() req: RequestPersonnelModel,
    @Body() dto: CreateRoomImageDto & { roomId: string },
  ): Promise<ResponseModel<RoomImage>> {
    try {
      const image = await this.roomService.createRoomImageByPersonnel(
        req.user.id,
        dto,
      )

      return { data: image }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Personnel Authorization')
  @UseGuards(PersonnelJwtAuthGuard, PersonnelPasswordChangedGuard)
  @Delete('/my/images/:imageId')
  async deleteMyRoomImage(
    @Request() req: RequestPersonnelModel,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<ResponseModel<RoomImage>> {
    try {
      const image = await this.roomService.deleteRoomImageByPersonnel(
        req.user.id,
        imageId,
      )

      return { data: image }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Post('/seed')
  async seedRooms(): Promise<ResponseModel<Room[]>> {
    try {
      const rooms = await this.roomService.seedRooms()

      return { data: rooms }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.BUILDING)
  @Post()
  async createRoom(
    @Body() dto: CreateRoomDto,
  ): Promise<ResponseModel<Room>> {
    try {
      const room = await this.roomService.createRoom(dto)

      return { data: room }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get('/:id')
  async getRoomById(@Param('id') id: string): Promise<ResponseModel<Room>> {
    try {
      const room = await this.roomService.getRoomById(id)

      return { data: room }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.BUILDING)
  @Patch('/:id')
  async updateRoom(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ): Promise<ResponseModel<Room>> {
    try {
      const room = await this.roomService.updateRoom(id, dto)

      return { data: room }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Delete('/:id')
  async deleteRoom(@Param('id') id: string): Promise<ResponseModel<Room>> {
    try {
      const room = await this.roomService.deleteRoom(id)

      return { data: room }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get('/:id/personnels')
  async getRoomPersonnels(
    @Param('id') id: string,
  ): Promise<ResponseModel<Personnel[]>> {
    try {
      const personnels = await this.roomService.getRoomPersonnels(id)

      return { data: personnels, meta: { total: personnels.length } }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.BUILDING)
  @Post('/:id/assign/:personnelId')
  async assignPersonnel(
    @Param('id') id: string,
    @Param('personnelId') personnelId: string,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.roomService.assignPersonnel(
        id,
        personnelId,
      )

      return { data: personnel }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL, PersonnelAdminRole.BUILDING)
  @Delete('/:id/assign/:personnelId')
  async unassignPersonnel(
    @Param('id') id: string,
    @Param('personnelId') personnelId: string,
  ): Promise<ResponseModel<Personnel>> {
    try {
      const personnel = await this.roomService.unassignPersonnel(
        id,
        personnelId,
      )

      return { data: personnel }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get('/:id/images')
  async getRoomImages(
    @Param('id') id: string,
  ): Promise<ResponseModel<RoomImage[]>> {
    try {
      const images = await this.roomService.getRoomImages(id)

      return { data: images, meta: { total: images.length } }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Post('/:id/images')
  async createRoomImage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreateRoomImageDto,
  ): Promise<ResponseModel<RoomImage>> {
    try {
      const image = await this.roomService.createRoomImage(
        id,
        req.user.id,
        dto,
      )

      return { data: image }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.BUILDING)
  @Delete('/:id/images/:imageId')
  async deleteRoomImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ): Promise<ResponseModel<RoomImage>> {
    try {
      const image = await this.roomService.deleteRoomImage(id, imageId)

      return { data: image }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
