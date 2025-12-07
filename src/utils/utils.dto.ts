import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'
import { PaginationDto } from './pagination'

export class DateRangeDto extends PaginationDto {
  @ApiProperty({
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDateString()
  from?: string

  @ApiProperty({
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDateString()
  to?: string
}
