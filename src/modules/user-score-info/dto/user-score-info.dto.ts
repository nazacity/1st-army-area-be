import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

export class UserScoreInfoCreateDto {}

export class UserScoreInfoUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  time: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  distance: number
}

export class UserScoreInfoQueryDto extends PaginationDto {}

export class UserScoreInfoByPublicQueryDto extends PaginationDto {
  @ApiProperty({
    default: new Date(),
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date

  @ApiProperty({
    default: new Date(),
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date
}
