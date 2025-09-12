import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  DeleteDateColumn,
} from 'typeorm';
import { VoucherEntity } from './voucher.entity';
import { UserEntity } from './users.entity';

@Unique(['user', 'voucher'])
@Entity({ name: 'voucher-users' })
export class VoucherUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.vouchers)
  user: UserEntity;

  @ManyToOne(() => VoucherEntity, (voucher) => voucher.voucherUsers)
  voucher: VoucherEntity;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
