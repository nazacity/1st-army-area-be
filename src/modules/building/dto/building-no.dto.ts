import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

export class BuildingNoCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buildNo: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  unitId: string
}

export class BuildingNoUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  buildNo: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  unitId: string
}

export class BuildingNoQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
