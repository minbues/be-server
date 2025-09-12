import { CartEntity } from '../../entities/carts.entity';
import { CartItemMapper } from './cart-item/cart-item.mapper';

export class CartMapper {
  static toDomain(cart: CartEntity) {
    return {
      id: cart.id,
      items: CartItemMapper.toDomainList(cart.items),
    };
  }
}
