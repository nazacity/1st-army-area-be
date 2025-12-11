import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator'
import { UserBase } from 'src/modules/user/entities/user.entity'
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

export class UserScoreInfoByUserQueryDto extends PaginationDto {}

export class UserScoreInfoByPublicQueryDto extends PaginationDto {
  @ApiProperty({
    default: 11,
  })
  @IsNotEmpty()
  @IsNumberString()
  month: number

  @ApiProperty({
    default: 2025,
  })
  @IsNotEmpty()
  @IsNumberString()
  year: number

  @ApiProperty({
    required: false,
    enum: UserBase,
  })
  @IsOptional()
  @IsString()
  base: string
}
