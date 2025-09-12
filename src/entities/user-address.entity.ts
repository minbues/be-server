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
import { UserEntity } from './users.entity';

@Entity({
  name: 'user-address',
})
export class UserAddressEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, nullable: true })
  fullName: string;

  @Column({ type: String, nullable: false })
  phone: string;

  @Column({ type: String })
  street: string;

  @Column({ type: String })
  ward: string;

  @Column({ type: String })
  district: string;

  @Column({ type: String })
  city: string;

  @Column({ type: String })
  country: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ default: false })
  isDefault: boolean;

  // Many-to-One relation with User
  @ManyToOne(() => UserEntity, (user) => user.addresses)
  user: UserEntity;
}
