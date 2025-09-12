import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';
import { Pagination } from '../../utils/pagination/pagination.decorator';
import { UpdateOrderDto } from './dto/order.dto';

// @ApiBearerAuth()
// @Roles(RoleEnum.ADMIN)
// @UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Orders')
@Controller({
  path: 'orders',
  version: '1',
})
export class OrderController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async getOrders(
    @Pagination() pagination: IPagination,
    @Query('search') search?: string,
  ) {
    return await this.ordersService.getOrdersWithPaging(pagination, search);
  }

  @Patch('update/:orderId')
  @HttpCode(HttpStatus.OK)
  async manunalOrderUpdate(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return await this.ordersService.manunalOrderUpdate(orderId, dto);
  }
}
