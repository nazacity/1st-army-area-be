import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator'
import { UserBase } from 'src/modules/user/entities/user.entity'

export class SummaryByPublicQueryDto {
  @ApiProperty({
    default: 12,
  })
  @IsNotEmpty()
  @IsNumberString()
  month: number

  @ApiProperty({
    default: 2025,
  })
  @IsNotEmpty()
  @IsNumberString()
  year: number

  @ApiProperty({
    required: false,
    enum: UserBase,
  })
  @IsOptional()
  @IsString()
  base?: string
}
