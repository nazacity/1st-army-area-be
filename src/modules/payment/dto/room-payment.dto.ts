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

export class RoomPaymentQueryDto {
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
  roomId: string

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus

  @ApiPropertyOptional({ example: '2026-09' })
  @IsOptional()
  @IsString()
  period: string

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  from: string

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsDateString()
  to: string
}

export class CreateRoomPaymentDto {
  @ApiProperty({ example: 'uuid → room' })
  @IsUUID()
  roomId: string

  @ApiPropertyOptional({ example: 'uuid → personnel ผู้จ่าย' })
  @IsOptional()
  @IsUUID()
  paidByUserId?: string

  @ApiProperty({ example: 'ค่าส่งน้ำห้อง 405' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ example: '120.00' })
  @IsNumberString()
  amount: string

  @ApiPropertyOptional({ example: '2026-09' })
  @IsOptional()
  @IsString()
  period?: string

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

export class UpdateRoomPaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string

  @ApiPropertyOptional({ example: '120.00' })
  @IsOptional()
  @IsNumberString()
  amount?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  period?: string

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
