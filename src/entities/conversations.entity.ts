import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './users.entity';
import { MessageEntity } from './message.entity';

@Entity({ name: 'conversations' })
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'clientId' })
  client: UserEntity;

  @Column({ nullable: true })
  adminId: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'adminId' })
  admin: UserEntity;

  @Column({ default: false })
  isClosed: boolean;

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;
}
