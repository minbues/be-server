import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject } from 'class-validator';

export class UpdateMasterDataDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: {
      dayExpired: 180,
      dayShowExpire: 7,
    },
    required: true,
    type: Object,
  })
  @IsObject()
  data: any;
}
