import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  // decorators here
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MinLength,
} from 'class-validator';
import { lowerCaseTransformer } from '../../../utils/transformers/lower-case.transformer';
import { AuthProvidersEnum } from '../../../utils/enum';

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: AuthProvidersEnum, example: AuthProvidersEnum.EMAIL })
  provider: string;

  @ApiPropertyOptional()
  @IsOptional()
  socialId?: string | null;

  @ApiProperty({ example: 'John', type: String })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', type: String })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  role: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  status: number;
}

export class CreateUserByAdminDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(8, { message: 'Cần ít nhất 8 ký tự' })
  password: string;

  @ApiProperty({ example: 'John Doe', type: String })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  role: number;

  firstName?: string;
  lastName?: string;
}
