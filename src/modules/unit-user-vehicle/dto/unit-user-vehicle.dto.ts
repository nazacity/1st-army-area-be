import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import { UnitUserVehicleStatus } from '../entities/unit-user-vehicle.entity'

export class VehicleCreateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  licensePlate: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  brand: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  type: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  color: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  stickerCode: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  province: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  ownerFullName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  unitUserId: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  stickerId: string

  @ApiProperty({ default: UnitUserVehicleStatus.active })
  @IsOptional()
  @IsEnum(UnitUserVehicleStatus)
  status: UnitUserVehicleStatus
}

export class VehicleUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  licensePlate: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  brand: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  type: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  color: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  stickerCode: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  province: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  ownerFullName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  unitUserId: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  stickerId: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(UnitUserVehicleStatus)
  status: UnitUserVehicleStatus
}

export class VehicleQueryDto extends PaginationDto {
  @ApiProperty({ required: false, enum: UnitUserVehicleStatus })
  @IsOptional()
  @IsEnum(UnitUserVehicleStatus)
  status?: UnitUserVehicleStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitUserId?: string
}
