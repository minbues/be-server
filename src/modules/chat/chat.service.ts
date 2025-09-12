import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../../entities/message.entity';
import { ConversationEntity } from '../../entities/conversations.entity';
import { UsersService } from '../users/users.service';
import { MessageReponseType } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,

    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,

    private readonly usersService: UsersService,
  ) {}

  // Tạo hoặc lấy cuộc trò chuyện giữa client và admin
  async getOrCreateConversation(userId: number) {
    let conversation = await this.conversationRepo.findOne({
      where: { clientId: userId, isClosed: false },
    });

    const admin = await this.usersService.findRootAdmin(); // Hàm tìm admin chính

    if (!conversation) {
      conversation = this.conversationRepo.create({
        clientId: userId,
        adminId: admin?.id,
      });

      await this.conversationRepo.save(conversation);
    }

    return conversation;
  }

  // Lưu tin nhắn vào DB
  async createMessage(data: {
    conversationId: string;
    senderId: number;
    content: string;
  }): Promise<MessageReponseType> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: data.conversationId },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const sender = await this.usersService.findById(data.senderId);
    const message = this.messageRepo.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      sender: sender!,
      content: data.content,
    });

    conversation.lastMessageAt = new Date();
    await this.conversationRepo.save(conversation);

    const messageSaved = await this.messageRepo.save(message);

    return {
      id: messageSaved.id,
      conversationId: messageSaved.conversationId,
      senderId: messageSaved.senderId,
      content: messageSaved.content,
      senderName: message.sender.fullName,
      isRead: message.isRead,
    };
  }

  async countMessages(conversationId: string): Promise<number> {
    return this.messageRepo.count({ where: { conversationId } });
  }

  // Lấy toàn bộ tin nhắn trong 1 cuộc trò chuyện
  async getMessages(conversationId: string): Promise<MessageReponseType[]> {
    const messages = await this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });

    return messages.map((message) => ({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      senderName: message.sender.fullName,
      isRead: message.isRead,
    }));
  }

  async getAllConversations() {
    const rootAdmin = await this.usersService.findRootAdmin();
    if (!rootAdmin) throw new NotFoundException('Root admin not found');

    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.client', 'client')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('conversation.adminId = :adminId', { adminId: rootAdmin.id })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from('messages', 'm')
          .where('m.conversationId = conversation.id')
          .getQuery();
        return `EXISTS ${subQuery}`;
      })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    return conversations.map((conversation) => {
      const lastMessage = conversation.messages.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];

      return {
        id: conversation.id,
        client: {
          id: conversation.client.id,
          fullName: conversation.client.fullName,
          email: conversation.client.email,
        },
        lastMessage: {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId,
        },
        updatedAt: conversation.updatedAt,
        isClosed: conversation.isClosed,
      };
    });
  }
  async getConversationById(conversationId: string) {
    const rootAdmin = await this.usersService.findRootAdmin();
    if (!rootAdmin) throw new NotFoundException('Root admin not found');

    const conversation = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.client', 'client')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('conversation.id = :conversationId', { conversationId })
      .andWhere('conversation.adminId = :adminId', { adminId: rootAdmin.id })
      .orderBy('conversation.updatedAt', 'DESC')
      .getOne();

    if (!conversation) throw new NotFoundException('Conversation not found');

    const lastMessage = conversation.messages.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    return {
      conversation: {
        id: conversation.id,
        client: {
          id: conversation.client.id,
          fullName: conversation.client.fullName,
          email: conversation.client.email,
        },
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        updatedAt: conversation.updatedAt,
        isClosed: conversation.isClosed,
      },
      adminId: rootAdmin.id,
    };
  }
}
