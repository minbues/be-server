import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { VerifyCodeEnum } from '../../../utils/enum';

export class CreateUserVerifyDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  codeExpires: Date;

  @IsEnum(VerifyCodeEnum)
  @IsNotEmpty()
  type: VerifyCodeEnum;
}
