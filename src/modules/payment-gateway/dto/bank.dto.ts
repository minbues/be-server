import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  IsBooleanString,
  IsOptional,
} from 'class-validator';

export class CreateBankDto {
  @ApiProperty({ description: 'Account number of the recipient' })
  @IsString()
  @IsNotEmpty()
  accountNo: string;

  @ApiProperty({ description: 'Account name of the recipient' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ description: 'Acquirer ID (bank BIN code)' })
  @IsNumber()
  @Min(1, { message: 'Acquirer ID must be a positive number' })
  acqId: number;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive: boolean;
}

export class GetBankDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo accountName hoặc accountNo',
    example: 'nguyen tien nhat',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái hoạt động',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
