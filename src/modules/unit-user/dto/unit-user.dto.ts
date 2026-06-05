import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import { Type } from 'class-transformer'
import {
  UnitUserGender,
  UnitUserRank,
  UnitUserStatus,
} from '../entities/unit-user.entity'
import { UnitUserDocumentCreateDto } from '../../unit-user-document/dto/unit-user-document.dto'

export class UnitUserCreateDto {
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

  @ApiProperty({ default: UnitUserGender.male })
  @IsOptional()
  @IsEnum(UnitUserGender)
  gender: UnitUserGender

  @ApiProperty()
  @IsOptional()
  @IsString()
  idCardNo: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  soliderIdCardNo: string

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthDate: Date

  @ApiProperty({ default: UnitUserStatus.active })
  @IsOptional()
  @IsEnum(UnitUserStatus)
  status: UnitUserStatus

  @ApiProperty()
  @IsOptional()
  @IsString()
  buildId: string | undefined

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  unitId: string

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
  position: string

  @ApiProperty({ type: [UnitUserDocumentCreateDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UnitUserDocumentCreateDto)
  documents?: UnitUserDocumentCreateDto[]
}

export class UnitUserUpdateDto {
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
  @IsEnum(UnitUserGender)
  gender: UnitUserGender

  @ApiProperty()
  @IsOptional()
  @IsString()
  idCardNo: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  soliderIdCardNo: string

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthDate: Date

  @ApiProperty()
  @IsOptional()
  @IsEnum(UnitUserStatus)
  status: UnitUserStatus

  @ApiProperty()
  @IsOptional()
  @IsString()
  buildId: string | undefined

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  unitId: string

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
  position: string

  @ApiProperty({ type: [UnitUserDocumentCreateDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UnitUserDocumentCreateDto)
  documents?: UnitUserDocumentCreateDto[]
}

export class UnitUserQueryByPublicDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}

export class UnitUserQueryDto extends PaginationDto {
  @ApiProperty({ required: false, enum: UnitUserStatus })
  @IsOptional()
  @IsEnum(UnitUserStatus)
  status?: UnitUserStatus

  @ApiProperty({ required: false, enum: UnitUserRank })
  @IsOptional()
  @IsEnum(UnitUserRank)
  rank?: UnitUserRank

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  buildId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  idCardNo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  soliderIdCardNo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  electionLocation?: string
}

export class IDCardUnitUserQueryDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  idCardNo: string

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  soliderIdCardNo: string
}
