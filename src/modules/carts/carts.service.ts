import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from '../../entities/carts.entity';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/cart.dto';
import { ProductsService } from '../products/products.service';
import { CartItemEntity } from '../../entities/cart-item.entity';
import { UsersService } from '../users/users.service';
import { CartMapper } from './carts.mapper';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async addToCart(userId: number, productData: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);
    await this.insertOrMergeCartItem(cart, productData, true);
    await this.cartRepository.save(cart);
    return CartMapper.toDomain(cart);
  }

  async addManyToCart(userId: number, items: AddToCartDto[]) {
    const cart = await this.getOrCreateCart(userId);

    for (const item of items) {
      await this.insertOrMergeCartItem(cart, item, true);
    }
    await this.cartRepository.save(cart);
    return CartMapper.toDomain(cart);
  }

  async getCartByUser(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    return CartMapper.toDomain(cart);
  }

  async getOrCreateCart(userId: number): Promise<CartEntity> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'items',
        'items.product',
        'items.variant',
        'items.size',
        'items.variant.images',
      ],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId },
        items: [],
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  private async insertOrMergeCartItem(
    cart: CartEntity,
    item: AddToCartDto,
    isAdd: boolean = true,
  ) {
    const [product, variant, size] = await Promise.all([
      this.productsService.validateProduct(item.productId),
      this.productsService.validateVariant(item.variantId),
      this.productsService.validateSize(item.sizeId),
    ]);

    const existingItem = cart.items.find(
      (cartItem) =>
        cartItem.variant.id === variant.id &&
        cartItem.size.id === size.id &&
        cartItem.product.id === product.id,
    );

    const requestedQuantity = item.quantity;
    const availableInventory = size.inventory;

    if (existingItem) {
      if (!isAdd) return;
      const newTotalQuantity = existingItem.quantity + requestedQuantity;

      if (newTotalQuantity > availableInventory) {
        throw new BadRequestException('Số lượng tồn kho không đủ để thêm!');
      }
      existingItem.quantity = newTotalQuantity;
    } else {
      if (!isAdd) return;
      if (requestedQuantity > availableInventory) {
        throw new BadRequestException('Số lượng tồn kho không đủ để thêm!');
      }

      const newItem = this.cartItemRepository.create({
        cart,
        product,
        variant,
        size,
        quantity: requestedQuantity,
      });
      cart.items.push(newItem);
    }
  }

  async deleteCartItem(itemId: string) {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    await this.cartItemRepository.remove(item);

    const cart = await this.cartRepository.findOne({
      where: { id: item.cart.id },
      relations: [
        'items',
        'items.product',
        'items.variant',
        'items.size',
        'items.variant.images',
      ],
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    return CartMapper.toDomain(cart);
  }

  async deleteAllCartItem(cartId: string) {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    if (cart.items.length === 0) {
      throw new NotFoundException('Không có sản phẩm trong giỏ hàng để xóa');
    }

    return await this.cartItemRepository.remove(cart.items);
  }

  async getCartIdByUserId(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    return cart.id;
  }

  async getCartToOrder(cartId: string, userId: number) {
    return await this.cartRepository.findOne({
      where: { id: cartId, user: { id: userId } },
      relations: [
        'items',
        'items.product',
        'items.variant',
        'items.size',
        'items.variant.images',
      ],
    });
  }
}
