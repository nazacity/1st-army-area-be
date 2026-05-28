import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

export class UnitUserDocumentCreateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  docName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docUrl: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docType: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docSize: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  unitUserId: string
}

export class UnitUserDocumentUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  docName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docUrl: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docType: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  docSize: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  unitUserId: string
}

export class UnitUserDocumentQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitUserId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
