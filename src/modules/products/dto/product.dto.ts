import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantSizeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  soldQuantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  inventory?: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateVariantImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateVariantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantSizeDto)
  @IsOptional()
  sizes?: CreateVariantSizeDto[];

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantImageDto)
  @IsOptional()
  images?: CreateVariantImageDto[];
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  segmentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subCategoryId: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}

export class GetProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isArchived?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class UpdateVariantSizeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  soldQuantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  inventory?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateVariantImageDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateVariantDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ type: [UpdateVariantSizeDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateVariantSizeDto)
  @IsOptional()
  sizes: UpdateVariantSizeDto[];

  @ApiProperty({ type: [UpdateVariantImageDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateVariantImageDto)
  @IsOptional()
  images: UpdateVariantImageDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  segmentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subCategoryId: string;

  @ApiPropertyOptional({ type: [UpdateVariantDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateVariantDto)
  @IsOptional()
  variants: UpdateVariantDto[];
}

export class UpdateDiscountBulk {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty({ each: true })
  ids: string[];

  @ApiProperty()
  @IsNumber()
  discount: number;
}
