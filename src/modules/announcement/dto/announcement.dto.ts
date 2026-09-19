import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { AnnouncementLinkType } from '../entities/announcement.entity'

export class AnnouncementCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  subDescription?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailImgUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string

  @ApiPropertyOptional({ enum: AnnouncementLinkType })
  @IsOptional()
  @IsEnum(AnnouncementLinkType)
  linkType?: AnnouncementLinkType

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  pin?: number

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  display?: boolean
}

export class AnnouncementUpdateDto extends AnnouncementCreateDto {}

export class AnnouncementDisplayDto {
  @ApiProperty()
  @IsBoolean()
  display: boolean
}

export class AnnouncementPinDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(999)
  pin: number
}
