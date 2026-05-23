import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

export class UnitCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string
}

export class UnitUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string
}

export class UnitQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
