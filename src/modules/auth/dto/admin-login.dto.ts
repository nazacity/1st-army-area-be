import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class AdminLoginDto {
  @ApiProperty({ default: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ default: '123456' })
  @IsString()
  @IsNotEmpty()
  password: string
}
