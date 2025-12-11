import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import { UserBase, UserGender } from '../entities/user.entity'
import { UserScoreInfo } from 'src/modules/user-score-info/entities/user-score-info.entity'

export class UserCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lineId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  displayName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  profileImageUrl: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rank: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string

  @ApiProperty({
    default: UserGender.male,
  })
  @IsNotEmpty()
  @IsEnum(UserGender)
  gender: UserGender

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  base: string
}

export class UserCreate {
  lineId: string
  displayName: string
  profileImageUrl: string
  rank: string
  firstName: string
  lastName: string
  gender: UserGender
  base: string
  score: UserScoreInfo
}

export class UserUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  displayName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  profileImageUrl: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rank: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string

  @ApiProperty({
    default: UserGender.male,
  })
  @IsNotEmpty()
  @IsEnum(UserGender)
  gender: UserGender

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  base: string
}

export class UserQueryDto extends PaginationDto {
  @ApiProperty({
    required: false,
    enum: UserBase,
  })
  @IsOptional()
  @IsString()
  base?: string
}
