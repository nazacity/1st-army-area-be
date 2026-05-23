import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import {
  NotUnitUserGender,
  NotUnitUserStatus,
} from '../entities/not-unit-user.entity'

export class NotUnitUserCreateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  titleName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string

  @ApiProperty({ default: NotUnitUserGender.male })
  @IsOptional()
  @IsEnum(NotUnitUserGender)
  gender: NotUnitUserGender

  @ApiProperty()
  @IsOptional()
  @IsString()
  idCardNo: string

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthDate: Date

  @ApiProperty()
  @IsOptional()
  @IsString()
  relationshipToUnitUser: string

  @ApiProperty({ default: NotUnitUserStatus.available })
  @IsOptional()
  @IsEnum(NotUnitUserStatus)
  status: NotUnitUserStatus

  @ApiProperty()
  @IsOptional()
  @IsString()
  electionLocation: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneNumber: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  profileImage: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  career: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  unitUserId: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  buildId: string
}

export class NotUnitUserUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  titleName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(NotUnitUserGender)
  gender: NotUnitUserGender

  @ApiProperty()
  @IsOptional()
  @IsString()
  idCardNo: string

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthDate: Date

  @ApiProperty()
  @IsOptional()
  @IsString()
  relationshipToUnitUser: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(NotUnitUserStatus)
  status: NotUnitUserStatus

  @ApiProperty()
  @IsOptional()
  @IsString()
  electionLocation: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneNumber: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  profileImage: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  career: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  unitUserId: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  buildId: string
}

export class NotUnitUserQueryDto extends PaginationDto {
  @ApiProperty({ required: false, enum: NotUnitUserStatus })
  @IsOptional()
  @IsEnum(NotUnitUserStatus)
  status?: NotUnitUserStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitUserId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  buildId?: string
}
