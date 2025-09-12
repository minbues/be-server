import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from '../entities/products.entity';
import { VariantEntity } from '../entities/variants.entity';
import { VariantSizeEntity } from '../entities/variant-size.entity';
import { CartEntity } from './carts.entity';

@Entity({ name: 'cart-item' })
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: CartEntity;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @ManyToOne(() => VariantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variantId' })
  variant: VariantEntity;

  @ManyToOne(() => VariantSizeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sizeId' })
  size: VariantSizeEntity;

  @Column({ type: 'int' })
  quantity: number;
}
