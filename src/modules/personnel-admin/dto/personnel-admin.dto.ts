import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'
import { PersonnelAdminRole } from '../entities/personnel-admin.entity'

export class PersonnelAdminCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImageUrl: string

  @ApiPropertyOptional({ enum: PersonnelAdminRole })
  @IsOptional()
  @IsEnum(PersonnelAdminRole)
  role?: PersonnelAdminRole
}

export class PersonnelAdminUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImageUrl: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  password: string

  @ApiPropertyOptional({ enum: PersonnelAdminRole })
  @IsOptional()
  @IsEnum(PersonnelAdminRole)
  role?: PersonnelAdminRole

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive: boolean
}

export class PersonnelAdminQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
