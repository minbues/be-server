import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RevenueType, SellerType } from '../../utils/enum';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';
import { Pagination } from '../../utils/pagination/pagination.decorator';

@ApiTags('Analytics')
@Controller({
  path: 'analytics',
  version: '1',
})
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAnalytics() {
    return await this.analyticsService.getAnalytics();
  }

  @Get('/revenue')
  async getRevenue(
    @Query('type') type: RevenueType,
    @Query('year') year?: number,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return await this.analyticsService.getRevenue(type, year, start, end);
  }

  @Get('/product')
  async getTopProducts(
    @Query('type') type: RevenueType,
    @Query('sellerType') sellerType: SellerType,
    @Query('limit') limit: number,
    @Query('year') year?: number,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return await this.analyticsService.getTopProducts(
      type,
      sellerType,
      Number(limit),
      year,
      start,
      end,
    );
  }

  @Get('/inventory')
  @ApiPagination()
  async getProductsInventory(@Pagination() pagination: IPagination) {
    return await this.analyticsService.getProductsInventory(pagination);
  }
}
