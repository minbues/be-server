import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RoleEntity } from './roles.entity';
import { StatusEntity } from './status.entity';
import { AuthProvidersEnum } from '../utils/enum';
import { UserAddressEntity } from './user-address.entity';
import { VoucherUserEntity } from './voucher-user.entity';

@Entity({
  name: 'user',
})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: String, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: AuthProvidersEnum.EMAIL })
  provider: string;

  @Index()
  @Column({ type: String, nullable: true })
  socialId?: string | null;

  @Index()
  @Column({ type: String, nullable: false })
  firstName: string;

  @Index()
  @Column({ type: String, nullable: false })
  lastName: string;

  @Index()
  @Column({ type: String, nullable: false })
  fullName: string;

  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role: RoleEntity;

  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status: StatusEntity;

  @Column({ default: 0 })
  point: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => UserAddressEntity, (address) => address.user)
  addresses?: UserAddressEntity[];

  @OneToMany(() => VoucherUserEntity, (voucherUser) => voucherUser.user)
  vouchers?: VoucherUserEntity[];
}
