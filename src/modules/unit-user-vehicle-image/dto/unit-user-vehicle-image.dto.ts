import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UnitUserVehicleImageCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  imageUrl: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  vehicleId: string
}

export class UnitUserVehicleImageUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrl: string
}
