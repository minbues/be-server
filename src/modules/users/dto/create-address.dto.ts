import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
  IsNotEmpty,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Vu Thi Huong', type: String })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '0901234567', type: String })
  @IsString()
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty({ example: '123 Lê Lợi', type: String })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Phường Bến Nghé', type: String })
  @IsString()
  ward: string;

  @ApiProperty({ example: 'Quận 1', type: String })
  @IsString()
  district: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh', type: String })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Vietnam', type: String })
  @IsString()
  country: string;

  @ApiProperty({ example: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
