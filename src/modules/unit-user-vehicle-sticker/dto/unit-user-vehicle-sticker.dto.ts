import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator'
import {
  VehicleStickerRank,
  VehicleStickerType,
} from '../entities/unit-user-vehicle-sticker.entity'

export class VehicleStickerCreateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  code: string

  @ApiProperty({ default: VehicleStickerType.car })
  @IsOptional()
  @IsEnum(VehicleStickerType)
  type: VehicleStickerType

  @ApiProperty({ default: VehicleStickerRank.nco })
  @IsOptional()
  @IsEnum(VehicleStickerRank)
  rank: VehicleStickerRank

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  expired: Date
}

export class VehicleStickerUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  code: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(VehicleStickerType)
  type: VehicleStickerType

  @ApiProperty()
  @IsOptional()
  @IsEnum(VehicleStickerRank)
  rank: VehicleStickerRank

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  expired: Date
}
