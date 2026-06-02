import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import { UnitUserVehicleStatus } from '../entities/unit-user-vehicle.entity'
import { Type } from 'class-transformer'

export class UnitUserVehicleImageCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  imageUrl: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  vehicleId: string
}

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

  @ApiProperty({ type: [UnitUserVehicleImageCreateDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UnitUserVehicleImageCreateDto)
  images?: UnitUserVehicleImageCreateDto[]
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

  @ApiProperty({ type: [UnitUserVehicleImageCreateDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UnitUserVehicleImageCreateDto)
  images?: UnitUserVehicleImageCreateDto[]
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
