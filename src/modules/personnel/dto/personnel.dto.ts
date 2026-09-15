import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBooleanString,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from 'class-validator'
import { PersonnelType } from '../entities/personnel.entity'

export class PersonnelQueryDto {
  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsOptional()
  @IsNumberString()
  take: string

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsNumberString()
  page: string

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  groupId: string

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  roomId: string

  @ApiPropertyOptional({ enum: PersonnelType })
  @IsOptional()
  @IsEnum(PersonnelType)
  type: PersonnelType

  @ApiPropertyOptional({ example: 'สมชาย' })
  @IsOptional()
  @IsString()
  searchText: string

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsBooleanString()
  isSpecialForces: string
}

export class CreatePersonnelDto {
  @ApiProperty({ example: '105105' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ example: '1992-01-08' })
  @IsDateString()
  dateOfBirth: string

  @ApiProperty({ example: '1509901114792' })
  @IsString()
  @Length(13, 13)
  citizenId: string

  @ApiProperty({ enum: PersonnelType })
  @IsEnum(PersonnelType)
  type: PersonnelType

  @ApiPropertyOptional({ example: 'ไทย' })
  @IsOptional()
  @IsString()
  country?: string

  @ApiPropertyOptional({ example: 'ราบ' })
  @IsOptional()
  @IsString()
  branchOfService?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isSpecialForces?: boolean

  @ApiProperty({ example: 'พ.ต.' })
  @IsString()
  @IsNotEmpty()
  rank: string

  @ApiProperty({ example: 'สมชาย' })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ example: 'ใจดี' })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nickName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  schoolEmail?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lineId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lineUserId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origin?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preCadetClass?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unitBeforeCourse?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  militaryId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  weight?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  height?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloodType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicalConditions?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remark?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleRegistration?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeProvince?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImage?: string

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  groupId?: string

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  roomId?: string
}

export class UpdatePersonnelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(13, 13)
  citizenId?: string

  @ApiPropertyOptional({ enum: PersonnelType })
  @IsOptional()
  @IsEnum(PersonnelType)
  type?: PersonnelType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchOfService?: string

  @ApiPropertyOptional()
  @IsOptional()
  isSpecialForces?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rank?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nickName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  schoolEmail?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lineId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lineUserId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origin?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preCadetClass?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unitBeforeCourse?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  militaryId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  weight?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  height?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloodType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicalConditions?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remark?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleRegistration?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeProvince?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImage?: string

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  groupId?: string

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  roomId?: string
}

export class UpdateMeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lineId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImage?: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  confirmPassword: string
}

export class PersonnelSignInDto {
  @ApiProperty({ example: '105105' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ example: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string
}
