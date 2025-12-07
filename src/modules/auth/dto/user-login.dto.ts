import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UserLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lineId: string
}
