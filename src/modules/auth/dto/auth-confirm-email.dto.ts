import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { VerifyCodeEnum } from '../../../utils/enum';

export class AuthVerifyEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 characters' })
  @Transform(({ value }) => String(value))
  code: string;

  @ApiProperty()
  @IsEnum(VerifyCodeEnum)
  @IsNotEmpty()
  type: VerifyCodeEnum;
}
