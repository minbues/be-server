import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';
import { DiscountType } from '../../../utils/enum';

export class CreateVoucherDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENT,
  })
  @IsEnum(DiscountType)
  @IsNotEmpty()
  type: DiscountType;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01, { message: 'Discount must be greater than 0' })
  discount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class GetVoucherDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class ApplyVoucherDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}
