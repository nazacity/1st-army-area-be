import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import { BuildingStatus, BuildingType } from '../entities/building.entity'

export class BuildingCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  buildingNoId: string

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  floor: number

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  no: number

  @ApiProperty({ default: BuildingStatus.enabled })
  @IsOptional()
  @IsEnum(BuildingStatus)
  status: BuildingStatus

  @ApiProperty({ default: BuildingType['เรือนแถว'] })
  @IsOptional()
  @IsEnum(BuildingType)
  type: BuildingType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  unitId: string
}

export class BuildingUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  buildingNoId: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  floor: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  no: number

  @ApiProperty()
  @IsOptional()
  @IsEnum(BuildingStatus)
  status: BuildingStatus

  @ApiProperty()
  @IsOptional()
  @IsEnum(BuildingType)
  type: BuildingType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  unitId: string
}

export class BuildingQueryDto extends PaginationDto {
  @ApiProperty({ required: false, enum: BuildingStatus })
  @IsOptional()
  @IsEnum(BuildingStatus)
  status?: BuildingStatus

  @ApiProperty({ required: false, enum: BuildingType })
  @IsOptional()
  @IsEnum(BuildingType)
  type?: BuildingType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  unitId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  buildingNoId?: string
}

export class BuildingQueryByPublicDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  buildingNoId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}

export class AutoCreateBuildingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buildNo: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  floorCount: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  roomCount: number

  @ApiProperty({ default: BuildingType['เรือนแถว'] })
  @IsOptional()
  @IsEnum(BuildingType)
  type: BuildingType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  unitId: string
}
