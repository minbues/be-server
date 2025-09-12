import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatusEnum, PaymentMethodEnum } from '../../../utils/enum';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  addressId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voucherId: string;

  @ApiProperty()
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  point?: string;
}

export class UpdateOrderDto {
  @ApiProperty()
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;
}
