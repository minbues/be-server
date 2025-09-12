import { EntityRelationalHelper } from '../utils/relational-entity-helper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './categories.entity';

@Entity({
  name: 'sub-categories',
})
export class SubCategoryEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, nullable: false })
  name: string;

  @Column({ type: String, nullable: false })
  subCateSlug: string;

  @Column({ type: Boolean, default: true })
  isActive: boolean;

  @ManyToOne(() => CategoryEntity, (category) => category.subCategories)
  category: CategoryEntity;

  @Column()
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
