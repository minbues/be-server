import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '../../utils/enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { CartService } from '../carts/carts.service';
import { CreateOrderDto } from './dto/order.dto';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';
import { Pagination } from '../../utils/pagination/pagination.decorator';

@ApiBearerAuth()
@Roles(RoleEnum.USER)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Orders-Public')
@Controller({
  path: 'orders-public',
  version: '1',
})
export class OrderPublicController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.id;
    const cartId = await this.cartService.getCartIdByUserId(Number(userId));
    return await this.ordersService.createOrder(cartId, userId, dto);
  }

  @Get('history')
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async getOrdersByUser(
    @Req() req: any,
    @Pagination() pagination: IPagination,
  ) {
    const userId = req.user.id;
    return await this.ordersService.getOrderByUserId(userId, pagination);
  }

  @Patch('cancel/:orderId')
  @HttpCode(HttpStatus.OK)
  async manualOrderCancellation(@Param('orderId') orderId: string) {
    return await this.ordersService.manualOrderCancellation(orderId);
  }

  @Get('detail/:orderId')
  @HttpCode(HttpStatus.OK)
  async getDetailPaymentByOrderId(@Param('orderId') orderId: string) {
    return await this.ordersService.getDetailPaymentByOrderId(orderId);
  }
}
