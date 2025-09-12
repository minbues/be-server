import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Vu Thi Huong', type: String })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '0909876543', type: String })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('VN')
  phone?: string;

  @ApiPropertyOptional({ example: '456 Hai Bà Trưng', type: String })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: 'Phường Tân Định', type: String })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ example: 'Quận 3', type: String })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'TP. Hồ Chí Minh', type: String })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Vietnam', type: String })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
