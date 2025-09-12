import { EntityRelationalHelper } from '../utils/relational-entity-helper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SegmentEntity } from './segments.entity';
import { CategoryEntity } from './categories.entity';
import { SubCategoryEntity } from './sub-categories.entity';
import { VariantEntity } from './variants.entity';
import { ProductReviewEntity } from './product-review.entity';

@Entity({
  name: 'products',
})
export class ProductEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, nullable: false })
  name: string;

  @Column({ type: Number, nullable: false })
  price: number;

  @Column({ type: String, nullable: false })
  description: string;

  @Column({ type: Boolean, default: false })
  isActive: boolean;

  @Column({ type: Boolean, default: false })
  isArchived: boolean;

  @Column({ type: Number, default: 0 })
  discount: number;

  @Column({ type: Number })
  totalQuantity: number;

  @Column({ type: Number })
  totalSoldQuantity: number;

  @Column({ type: Number })
  totalInventory: number;

  @ManyToOne(() => SegmentEntity)
  @JoinColumn({ name: 'segmentId' })
  segment: SegmentEntity;

  @Column()
  segmentId: string;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @Column()
  categoryId: string;

  @ManyToOne(() => SubCategoryEntity)
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: SubCategoryEntity;

  @Column()
  subCategoryId: string;

  @OneToMany(() => VariantEntity, (variant) => variant.product)
  variants: VariantEntity[];

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  averageRating: number; // Điểm đánh giá trung bình

  @Column({ default: 0 })
  totalReviews: number; // Tổng số đánh giá

  @OneToMany(() => ProductReviewEntity, (review) => review.product)
  reviews: ProductReviewEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
