import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class GenerateQRDto {
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

  @ApiProperty({ description: 'Amount to be transferred' })
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({ description: 'Additional information for the transaction' })
  @IsString()
  @IsNotEmpty()
  addInfo: string;
}
