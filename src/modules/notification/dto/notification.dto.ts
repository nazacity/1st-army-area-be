import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { NotificationTargetType } from '../entities/notification.entity'

export class NotificationCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiProperty({ enum: NotificationTargetType })
  @IsEnum(NotificationTargetType)
  targetType: NotificationTargetType

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  groupIds?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  branches?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  userIds?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string
}
