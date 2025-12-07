import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { UserScoreInfo } from 'src/modules/user-score-info/entities/user-score-info.entity'
import { PaginationDto } from 'src/utils/pagination'

export class UserScoreHistoryCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  time: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  distance: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  imageUrl: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userScoreInfoId: string
}

export class UserScoreHistoryCreate {
  time: number
  distance: number
  imageUrl: string
  scoreInfo: UserScoreInfo
}

export class UserScoreHistoryUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  time: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  distance: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  imageUrl: string
}

export class UserScoreHistoryQueryDto extends PaginationDto {}

export class UserScoreHistoryByUserScoreIdQueryDto extends PaginationDto {
  userScoreId: string
}
