import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import { BuildingStatus, BuildingType } from '../entities/build.entity'

export class BuildCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buildNo: string

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

export class BuildUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  buildNo: string

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

export class BuildQueryDto extends PaginationDto {
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
}
