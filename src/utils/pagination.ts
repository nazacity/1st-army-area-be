import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, IsOptional } from 'class-validator'
import * as _ from 'lodash'

export class PaginationDto {
  @IsNumberString()
  @ApiProperty({
    type: Number,
    example: 10,
    required: false,
    description: 'If limit equal -1 then return all items',
  })
  take: string

  @IsOptional()
  @IsNumberString()
  @ApiProperty({
    type: Number,
    example: 1,
    required: false,
  })
  page: string
}

export const paginationUtil = (
  query: PaginationDto,
): { take: number; skip: number } => {
  const { take, page } = query
  const skip = (parseInt(page) - 1) * parseInt(take)

  if (take === '-1') {
    return {
      take: null,
      skip: skip,
    }
  }

  return {
    take: parseInt(take),
    skip,
  }
}
