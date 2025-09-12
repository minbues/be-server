import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DiscountEventEnum, EventStatusEnum } from '../../../utils/enum';

export class CreateScheduleDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: DiscountEventEnum.ALL_SHOP })
  @IsEnum(DiscountEventEnum)
  type: DiscountEventEnum;

  @ApiProperty({ example: EventStatusEnum.IN_COMING })
  @IsEnum(EventStatusEnum)
  status: EventStatusEnum;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pid?: string;

  @ApiProperty({ type: Date, example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({ type: Date, example: '2025-06-30T23:59:59.000Z' })
  @IsDateString()
  endTime: Date;
}

export class UpdateScheduleDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiProperty({ example: DiscountEventEnum.ALL_SHOP })
  @IsEnum(DiscountEventEnum)
  type: DiscountEventEnum;

  @ApiProperty({ example: EventStatusEnum.IN_COMING })
  @IsEnum(EventStatusEnum)
  status: EventStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pid?: string;

  @ApiProperty({ type: Date, example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({ type: Date, example: '2025-06-30T23:59:59.000Z' })
  @IsDateString()
  endTime: Date;
}
