import {
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'bank',
})
export class BankEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String })
  accountNo: string;

  @Column({ type: Number })
  acqId: number;

  @Column({ type: String })
  accountName: string;

  @Column({ type: Boolean, default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastOrder: Date;
}
