import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

export class UnitUserVehicleDocumentCreateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  docName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docUrl: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docType: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docSize: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  vehicleId: string
}

export class UnitUserVehicleDocumentUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  docName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docUrl: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docType: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docSize: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  vehicleId: string
}

export class UnitUserVehicleDocumentQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vehicleId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
