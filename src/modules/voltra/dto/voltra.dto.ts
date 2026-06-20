import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { VoltraPlatform, VoltraTokenType } from '../entities/voltra-device-token.entity'

export class RegisterVoltraTokenDto {
  @IsString()
  token: string

  @IsEnum(['push-to-update', 'push-to-start'])
  type: VoltraTokenType

  @IsEnum(['ios', 'android'])
  platform: VoltraPlatform

  @IsOptional()
  @IsNumber()
  @Min(0)
  orderId?: number
}

export class OrderTrackingStateDto {
  @IsNumber()
  @Min(0)
  orderId: number

  @IsString()
  statusName: string

  @IsOptional()
  @IsString()
  statusNameEn?: string

  @IsOptional()
  @IsString()
  riderName?: string

  @IsString()
  timeDeliveryText: string

  @IsNumber()
  @Min(0)
  activeStep: number
}

export class PushOrderTrackingUpdateDto {
  @IsString()
  customerId: string

  @IsOptional()
  @IsNumber()
  orderId?: number

  state: OrderTrackingStateDto
}

export class StopOrderTrackingDto {
  @IsString()
  customerId: string

  @IsOptional()
  @IsNumber()
  orderId?: number
}

export class WidgetAuthTestDto {
  @IsString()
  token: string

  @IsOptional()
  @IsBoolean()
  valid?: boolean
}
