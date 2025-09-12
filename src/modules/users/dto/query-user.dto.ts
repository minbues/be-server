import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

export class FilterUserDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  role?: number | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  search?: string;
}
export class QueryUserDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterUserDto)
  filters?: FilterUserDto | null;
}
