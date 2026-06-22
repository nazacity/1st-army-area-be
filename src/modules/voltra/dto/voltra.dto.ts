import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import {
  VoltraPlatform,
  VoltraTokenType,
} from '../entities/voltra-device-token.entity'
import { ApiProperty } from '@nestjs/swagger'

export type DeliveryStatus =
  | 'confirmed'
  | 'preparing'
  | 'waiting'
  | 'delivering'
  | 'completed'

const DELIVERY_STATUSES: DeliveryStatus[] = [
  'confirmed',
  'preparing',
  'waiting',
  'delivering',
  'completed',
]

export class DeliveryLiveActivityDataDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  orderId: number

  @ApiProperty()
  @IsIn(DELIVERY_STATUSES)
  status: DeliveryStatus

  @ApiProperty()
  @IsString()
  statusLabel: string

  @ApiProperty()
  @IsString()
  locationName: string

  @ApiProperty()
  @IsString()
  eta: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  restaurantImageUrl?: string
}

export class RegisterVoltraTokenDto {
  @ApiProperty()
  @IsString()
  token: string

  @ApiProperty()
  @IsEnum(['push-to-update', 'push-to-start'])
  type: VoltraTokenType

  @ApiProperty()
  @IsEnum(['ios', 'android'])
  platform: VoltraPlatform

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderId?: number
}

export class OrderTrackingStateDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  orderId: number

  @ApiProperty()
  @IsString()
  statusName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  statusNameEn?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  riderName?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  locationName?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  restaurantImageUrl?: string

  @ApiProperty()
  @IsString()
  timeDeliveryText: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  activeStep: number
}

export class PushOrderTrackingUpdateDto {
  @ApiProperty()
  @IsString()
  customerId: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  orderId?: number

  @ApiProperty()
  state: OrderTrackingStateDto
}

export class StopOrderTrackingDto {
  @ApiProperty()
  @IsString()
  customerId: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  orderId?: number
}

export class WidgetAuthTestDto {
  @ApiProperty()
  @IsString()
  token: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  valid?: boolean
}
