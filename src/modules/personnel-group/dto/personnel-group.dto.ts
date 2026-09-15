import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class CreatePersonnelGroupDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'uuid → personnel' })
  @IsOptional()
  @IsUUID()
  leaderId?: string
}

export class UpdatePersonnelGroupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'uuid → personnel' })
  @IsOptional()
  @IsUUID()
  leaderId?: string
}
