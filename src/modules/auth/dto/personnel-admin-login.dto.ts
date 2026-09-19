import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class PersonnelAdminLoginDto {
  @ApiProperty({ default: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ default: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string
}
