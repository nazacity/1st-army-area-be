import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

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
  @IsNotEmpty()
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

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  units: string[]
}
