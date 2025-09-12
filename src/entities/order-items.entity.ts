import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ProductEntity } from './products.entity';
import { VariantEntity } from './variants.entity';
import { VariantSizeEntity } from './variant-size.entity';
import { OrderEntity } from './orders.entity';
import { ProductReviewEntity } from './product-review.entity';

@Entity({ name: 'order-items' })
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => OrderEntity, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;

  @Column()
  productId: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productPrice: number;

  @Column()
  variantId: string;

  @ManyToOne(() => VariantEntity)
  @JoinColumn({ name: 'variantId' })
  variant: VariantEntity;

  @Column()
  color: string;

  @Column()
  sizeId: string;

  @ManyToOne(() => VariantSizeEntity)
  @JoinColumn({ name: 'sizeId' })
  size: VariantSizeEntity;

  @Column()
  sizeValue: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Giá sau khi áp dụng giảm giá của sản phẩm

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // price * quantity

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isReviewed: boolean;

  @OneToOne(() => ProductReviewEntity, (review) => review.orderItem)
  review: ProductReviewEntity;
}
