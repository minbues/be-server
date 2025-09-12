import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VouchersService } from './voucher.service';
import { ApplyVoucherDto } from './dto/voucher.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../../utils/enum';
import { RolesGuard } from '../roles/roles.guard';

@ApiBearerAuth()
@Roles(RoleEnum.USER)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Vouchers-Public')
@Controller({
  path: 'vouchers-public',
  version: '1',
})
export class VouchersPublicController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('available')
  @HttpCode(HttpStatus.OK)
  async getVoucherByUserId(@Req() req: any) {
    const userId = req.user.id;
    return await this.vouchersService.getListVoucherValidByUserId(
      Number(userId),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getVoucherByCode(@Req() req: any, @Query('code') code: string) {
    const userId = req.user.id;
    return await this.vouchersService.getVoucherByCode(Number(userId), code);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async applyVoucher(
    @Body() applyVoucherDto: ApplyVoucherDto,
    @Req() req: any,
  ) {
    const { code } = applyVoucherDto;
    const userId = req.user.id;
    return await this.vouchersService.applyVoucher(userId, code);
  }
}
