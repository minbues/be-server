import { EntityRelationalHelper } from '../utils/relational-entity-helper';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VariantEntity } from './variants.entity';

@Entity({
  name: 'variant-sizes',
})
export class VariantSizeEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, nullable: false })
  size: string;

  @Column()
  quantity: number;

  @Column()
  soldQuantity: number;

  @Column()
  inventory: number;

  @Column({ type: Boolean, default: false })
  isActive: boolean;

  @ManyToOne(() => VariantEntity, (variant) => variant.sizes)
  @JoinColumn({ name: 'variantId' })
  variant: VariantEntity;

  @Column()
  variantId: string;
}
