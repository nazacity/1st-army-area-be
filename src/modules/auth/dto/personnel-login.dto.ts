import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class PersonnelLoginDto {
  @ApiProperty({ default: '105105' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ default: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string
}
