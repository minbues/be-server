import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './carts.service';
import { AddToCartDto } from './dto/cart.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleEnum } from '../../utils/enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

@ApiBearerAuth()
@Roles(RoleEnum.USER)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Cart')
@Controller({
  path: 'cart',
})
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = req.user.id;
    return await this.cartService.addToCart(Number(userId), dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCartByUser(@Req() req: any) {
    const userId = req.user.id;
    return await this.cartService.getCartByUser(Number(userId));
  }

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: AddToCartDto, isArray: true })
  async addManyToCart(@Req() req: any, @Body() dto: AddToCartDto[]) {
    const userId = req.user.id;
    return await this.cartService.addManyToCart(Number(userId), dto);
  }

  @Delete('item/:itemId')
  @HttpCode(HttpStatus.OK)
  async deleteCartItem(@Param('itemId') itemId: string) {
    return await this.cartService.deleteCartItem(itemId);
  }

  @Delete('all-item/:cartId')
  @HttpCode(HttpStatus.OK)
  async deleteAllCartItem(@Param('cartId') cartId: string) {
    return await this.cartService.deleteAllCartItem(cartId);
  }
}
