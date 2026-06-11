import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

export class AdminCreateDto {
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
  @IsOptional()
  @IsString()
  profileImageUrl: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string

  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  @IsArray()
  units: string[]
}

export class AdminUpdateDto {
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
}

export class AdminSuperUpdateDto extends AdminUpdateDto {
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  units: string[]
}

export class AdminQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
