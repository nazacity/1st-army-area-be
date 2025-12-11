import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UserLoginDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  displayName: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  profileImageUrl: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lineId: string
}
