import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBooleanString,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'

export class RoomQueryDto {
  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsOptional()
  @IsNumberString()
  take: string

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsNumberString()
  page: string

  @ApiPropertyOptional({ type: Number, example: 3 })
  @IsOptional()
  @IsNumberString()
  floor: string

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsBooleanString()
  isEmpty: string
}

export class CreateRoomDto {
  @ApiProperty({ example: '711' })
  @IsString()
  @IsNotEmpty()
  roomNumber: string

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  floor: number

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string
}

export class UpdateRoomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomNumber?: string

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  floor?: number

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string
}

export class CreateRoomImageDto {
  @ApiProperty({ example: 'https://r2.../room-405-1.jpg' })
  @IsString()
  @IsNotEmpty()
  image: string

  @ApiPropertyOptional({ example: 'ก่อนเข้าอยู่ ก.ย. 2026' })
  @IsOptional()
  @IsString()
  caption?: string

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  takenAt?: string
}
