import { DiscountEventEnum, EventStatusEnum } from '../utils/enum';
import { EntityRelationalHelper } from '../utils/relational-entity-helper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'discount-events' })
export class DiscountEventEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DiscountEventEnum,
    default: DiscountEventEnum.ALL_SHOP,
  })
  type: DiscountEventEnum;

  @Column({
    type: 'enum',
    enum: EventStatusEnum,
    default: EventStatusEnum.IN_COMING,
  })
  status: EventStatusEnum;

  @Column({ nullable: true })
  pid: string;

  @Column({ type: Number, default: 0 })
  discount: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
