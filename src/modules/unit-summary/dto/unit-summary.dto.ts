import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import { UnitUserRank, UnitUserStatus } from 'src/modules/unit-user/entities/unit-user.entity'
import { NotUnitUserStatus } from 'src/modules/not-unit-user/entities/not-unit-user.entity'
import { UnitUserVehicleStatus } from 'src/modules/unit-user-vehicle/entities/unit-user-vehicle.entity'
import { BuildingStatus, BuildingType } from 'src/modules/building/entities/building.entity'

export class UnitUserSummaryQueryDto extends PaginationDto {
  @ApiProperty({ required: false, enum: UnitUserStatus })
  @IsOptional()
  @IsEnum(UnitUserStatus)
  status?: UnitUserStatus

  @ApiProperty({ required: false, enum: UnitUserRank })
  @IsOptional()
  @IsEnum(UnitUserRank)
  rank?: UnitUserRank

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}

export class NotUnitUserSummaryQueryDto extends PaginationDto {
  @ApiProperty({ required: false, enum: NotUnitUserStatus })
  @IsOptional()
  @IsEnum(NotUnitUserStatus)
  status?: NotUnitUserStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}

export class VehicleSummaryQueryDto extends PaginationDto {
  @ApiProperty({ required: false, enum: UnitUserVehicleStatus })
  @IsOptional()
  @IsEnum(UnitUserVehicleStatus)
  status?: UnitUserVehicleStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}

export class BuildingSummaryQueryDto extends PaginationDto {
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
  buildingNoId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
