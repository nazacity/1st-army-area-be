import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { PersonnelVehicleType } from '../entities/personnel-vehicle.entity'

export class PersonnelVehicleQueryDto {
  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsOptional()
  @IsNumberString()
  take: string

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsNumberString()
  page: string

  @ApiPropertyOptional({ example: '6กฆ 5838' })
  @IsOptional()
  @IsString()
  searchText: string

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  personnelId: string

  @ApiPropertyOptional({ enum: PersonnelVehicleType })
  @IsOptional()
  @IsEnum(PersonnelVehicleType)
  type: PersonnelVehicleType
}

export class CreatePersonnelVehicleDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  personnelId: string

  @ApiProperty({ example: '6กฆ 5838' })
  @IsString()
  @IsNotEmpty()
  licensePlate: string

  @ApiProperty({ enum: PersonnelVehicleType })
  @IsEnum(PersonnelVehicleType)
  type: PersonnelVehicleType

  @ApiPropertyOptional({ example: 'กรุงเทพมหานคร' })
  @IsOptional()
  @IsString()
  province?: string

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  brand?: string

  @ApiPropertyOptional({ example: 'Camry' })
  @IsOptional()
  @IsString()
  model?: string

  @ApiPropertyOptional({ example: 'ดำ' })
  @IsOptional()
  @IsString()
  color?: string

  @ApiPropertyOptional({ example: 'พ.ต. กนก บุญผล' })
  @IsOptional()
  @IsString()
  ownerFullName?: string
}

export class CreateMyPersonnelVehicleDto {
  @ApiProperty({ example: '6กฆ 5838' })
  @IsString()
  @IsNotEmpty()
  licensePlate: string

  @ApiProperty({ enum: PersonnelVehicleType })
  @IsEnum(PersonnelVehicleType)
  type: PersonnelVehicleType

  @ApiPropertyOptional({ example: 'กรุงเทพมหานคร' })
  @IsOptional()
  @IsString()
  province?: string

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  brand?: string

  @ApiPropertyOptional({ example: 'Camry' })
  @IsOptional()
  @IsString()
  model?: string

  @ApiPropertyOptional({ example: 'ดำ' })
  @IsOptional()
  @IsString()
  color?: string

  @ApiPropertyOptional({ example: 'พ.ต. กนก บุญผล' })
  @IsOptional()
  @IsString()
  ownerFullName?: string
}

export class UpdatePersonnelVehicleDto {
  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  personnelId?: string

  @ApiPropertyOptional({ example: '6กฆ 5838' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  licensePlate?: string

  @ApiPropertyOptional({ enum: PersonnelVehicleType })
  @IsOptional()
  @IsEnum(PersonnelVehicleType)
  type?: PersonnelVehicleType

  @ApiPropertyOptional({ example: 'กรุงเทพมหานคร' })
  @IsOptional()
  @IsString()
  province?: string

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  brand?: string

  @ApiPropertyOptional({ example: 'Camry' })
  @IsOptional()
  @IsString()
  model?: string

  @ApiPropertyOptional({ example: 'ดำ' })
  @IsOptional()
  @IsString()
  color?: string

  @ApiPropertyOptional({ example: 'พ.ต. กนก บุญผล' })
  @IsOptional()
  @IsString()
  ownerFullName?: string
}
