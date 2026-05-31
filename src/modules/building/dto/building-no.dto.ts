import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

export class BuildingNoCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buildNo: string
}

export class BuildingNoUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  buildNo: string
}

export class BuildingNoQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
