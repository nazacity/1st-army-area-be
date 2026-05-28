import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/pagination'

export class NotUnitUserDocumentCreateDto {
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
  notUnitUserId: string
}

export class NotUnitUserDocumentUpdateDto {
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
  notUnitUserId: string
}

export class NotUnitUserDocumentQueryDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notUnitUserId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string
}
