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
  name: 'variant-images',
})
export class VariantImageEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, nullable: false })
  url: string;

  @ManyToOne(() => VariantEntity, (variant) => variant.images)
  @JoinColumn({ name: 'variantId' })
  variant: VariantEntity;

  @Column()
  variantId: string;
}
