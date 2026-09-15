import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { PaymentStatus } from '../entities/payment-status.enum'

export class UserPaymentQueryDto {
  @ApiPropertyOptional({ type: Number, example: 10 })
  @IsOptional()
  @IsNumberString()
  take: string

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @IsNumberString()
  page: string

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId: string

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  from: string

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsDateString()
  to: string
}

export class CreateUserPaymentDto {
  @ApiProperty({ example: 'ค่าเลี้ยงสังสรรค์รุ่น' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ example: '500.00' })
  @IsNumberString()
  amount: string

  @ApiProperty({ example: '2026-09-15' })
  @IsDateString()
  paymentDate: string

  @ApiPropertyOptional({ example: 'https://r2.../slip.jpg' })
  @IsOptional()
  @IsString()
  slipImage?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remark?: string
}

export class UpdateUserPaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string

  @ApiPropertyOptional({ example: '500.00' })
  @IsOptional()
  @IsNumberString()
  amount?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slipImage?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remark?: string
}

export class RejectPaymentDto {
  @ApiProperty({ example: 'สลิปไม่ตรงยอด' })
  @IsString()
  @IsNotEmpty()
  remark: string
}
