import { ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, MinLength } from 'class-validator';
import { lowerCaseTransformer } from '../../../utils/transformers/lower-case.transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  provider?: string;

  socialId?: string;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  role?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  status?: number;
}
