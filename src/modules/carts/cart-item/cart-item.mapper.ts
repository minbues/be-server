import { CartItemEntity } from '../../../entities/cart-item.entity';
import { CartItemStatusEnum } from '../../../utils/enum';

export class CartItemMapper {
  static toDomain(item: CartItemEntity) {
    let status: CartItemStatusEnum = CartItemStatusEnum.AVAILABLE;

    if (
      !item.product.isActive ||
      !item.variant.isActive ||
      !item.size.isActive
    ) {
      status = CartItemStatusEnum.UNAVAILABLE;
    } else if (item.size.inventory === 0) {
      status = CartItemStatusEnum.SOLD_OUT;
    }

    return {
      id: item.id,
      quantity: item.quantity,
      status,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        discount: item.product.discount,
        discountPrice:
          item.product.price -
          (item.product.price * item.product.discount) / 100,
      },
      variant: {
        id: item.variant.id,
        color: item.variant.color,
        image:
          item.variant?.images && item.variant.images.length > 0
            ? item.variant.images[0]?.url
            : null,
      },
      size: {
        id: item.size.id,
        size: item.size.size,
        inventory: item.size.inventory,
      },
    };
  }

  static toDomainList(items: CartItemEntity[]) {
    return items.map((item) => this.toDomain(item));
  }
}
