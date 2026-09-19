import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class LineTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string
}

export class LineSignInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lineUserId: string
}

export class PersonnelBindLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lineUserId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string
}
