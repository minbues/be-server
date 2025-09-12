import { EntityRelationalHelper } from '../utils/relational-entity-helper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from './products.entity';
import { VariantSizeEntity } from './variant-size.entity';
import { VariantImageEntity } from './variant-image.entity';

@Entity({
  name: 'variants',
})
export class VariantEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, nullable: false })
  color: string;

  @Column({ type: Boolean, default: false })
  isActive: boolean;

  @ManyToOne(() => ProductEntity, (product) => product.variants, {
    nullable: false,
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  productId: string;

  @OneToMany(() => VariantSizeEntity, (variantSize) => variantSize.variant, {
    cascade: true,
  })
  sizes: VariantSizeEntity[];

  @OneToMany(() => VariantImageEntity, (variantImage) => variantImage.variant, {
    cascade: true,
  })
  images: VariantImageEntity[];
}
