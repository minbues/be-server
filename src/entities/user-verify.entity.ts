import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './users.entity';
import { VerifyCodeEnum } from '../utils/enum';

@Entity({
  name: 'user-verify',
})
export class UserVerifyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: String, nullable: false })
  code: string;

  @Column({ type: Date, nullable: false })
  codeExpires: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: VerifyCodeEnum })
  type: VerifyCodeEnum;

  @Column({ default: true })
  isValid: boolean;
}
