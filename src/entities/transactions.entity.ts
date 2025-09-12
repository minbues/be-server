import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { OrderEntity } from './orders.entity';
import { EntityRelationalHelper } from '../utils/relational-entity-helper';

export enum TransactionStatusEnum {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity({ name: 'transactions' })
export class TransactionBankEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  transactionId: string;

  @Column({ type: 'jsonb', nullable: false })
  data: Record<string, any>;

  @Column({ nullable: true })
  orderId?: string;

  @OneToOne(() => OrderEntity, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order?: OrderEntity;

  @Column({
    type: 'enum',
    enum: TransactionStatusEnum,
    default: TransactionStatusEnum.PENDING,
  })
  status: TransactionStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
