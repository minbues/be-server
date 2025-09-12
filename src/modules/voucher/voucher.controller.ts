import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../utils/pagination/pagination.decorator';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';
import { VouchersService } from './voucher.service';
import { CreateVoucherDto, GetVoucherDto } from './dto/voucher.dto';

@ApiTags('Vouchers')
@Controller({
  path: 'vouchers',
  version: '1',
})
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVoucherDto) {
    return await this.vouchersService.createVoucher(dto);
  }

  @Get('all')
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async findAllVoucher(
    @Query() query: GetVoucherDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.vouchersService.findVouchersWithConditions(
      query,
      pagination,
    );
  }

  @Delete('/:voucherId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('voucherId') voucherId: string) {
    return await this.vouchersService.delete(voucherId);
  }

  @Patch('/:voucherId')
  @HttpCode(HttpStatus.CREATED)
  async update(
    @Param('voucherId') voucherId: string,
    @Body() dto: CreateVoucherDto,
  ) {
    return await this.vouchersService.updateVoucher(voucherId, dto);
  }
}
