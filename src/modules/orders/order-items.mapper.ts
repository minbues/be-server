import { CartItemEntity } from '../../entities/cart-item.entity';
import { OrderEntity } from '../../entities/orders.entity';
import { OrderItemEntity } from '../../entities/order-items.entity';

export class OrderItemMapper {
  static toEntity(
    cartItem: CartItemEntity,
    order: OrderEntity,
  ): OrderItemEntity {
    const discountPrice =
      cartItem.product.price -
      (cartItem.product.price * cartItem.product.discount) / 100;

    const subtotal = discountPrice * cartItem.quantity;

    return {
      order,
      productId: cartItem.product.id,
      product: cartItem.product,
      productName: cartItem.product.name,
      productPrice: cartItem.product.price,

      variantId: cartItem.variant.id,
      variant: cartItem.variant,
      color: cartItem.variant.color,

      sizeId: cartItem.size.id,
      size: cartItem.size,
      sizeValue: cartItem.size.size,

      quantity: cartItem.quantity,
      price: discountPrice,
      subtotal,
      isReviewed: false,
    } as OrderItemEntity;
  }

  static toEntityList(
    cartItems: CartItemEntity[],
    order: OrderEntity,
  ): OrderItemEntity[] {
    return cartItems.map((item) => this.toEntity(item, order));
  }
}
