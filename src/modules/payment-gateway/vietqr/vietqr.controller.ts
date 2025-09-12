import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VietQRService } from './vietqr.service';
import { GenerateQRDto } from '../dto/viet-qr.dto';

// @UseGuards(CmsGuard)
@ApiTags('VietQR')
@Controller('viet-qr')
// @ApiBearerAuth()
// @UseGuards(JWTAuthGuard)
export class VietQRController {
  constructor(private readonly vietQRService: VietQRService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateQR(@Body() dto: GenerateQRDto) {
    return await this.vietQRService.generateQR(dto);
  }

  @Get('generate/:id')
  @HttpCode(HttpStatus.OK)
  async generateQRByBankId(@Param('id') id: string) {
    return await this.vietQRService.generateQRByBankId(id);
  }
}
