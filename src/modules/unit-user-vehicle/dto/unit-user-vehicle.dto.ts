import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

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
}

export class VehicleQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitUserId?: string
}
