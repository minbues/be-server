import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './wss.enum';
import { OrderEntity } from '../../entities/orders.entity';
import { ChatService } from '../chat/chat.service';
import { MessageReponseType } from '../chat/dto/chat.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection {
  private readonly logger = new Logger(SocketGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Gửi thông báo hết hạn thanh toán
  sendPaymentExpiredNotification(userId: number, order: OrderEntity) {
    this.server
      .to(`user_${userId}`)
      .emit(SocketEvent.ORDER_PAYMENT_EXPIRED, { order });
  }

  sendOrderPaidNotification(userId: number, order: OrderEntity) {
    this.server
      .to(`user_${userId}`)
      .emit(SocketEvent.PAYMENT_SUCCESSFUL, { order });
  }

  // (Optional) Kết nối và join vào room userId
  handleConnection(client: any) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(`Client connected: ${userId}`);
    } else {
      this.logger.error('Missing userId, client will not join any room');
    }
  }

  @SubscribeMessage(SocketEvent.JOIN_CONVERSATION)
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `conversation_${data.conversationId}`;
    await client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage(SocketEvent.JOIN_ADMIN)
  async handleJoinAdminRoom(@ConnectedSocket() client: Socket) {
    const adminId = client.handshake.query.userId;
    if (!adminId) {
      this.logger.error('No adminId found in handshake query');
      return;
    }
    const room = `admin_${adminId}`;
    await client.join(room);
    this.logger.log(`Admin client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage(SocketEvent.SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: number;
      content: string;
    },
  ) {
    const messageCount = await this.chatService.countMessages(
      data.conversationId,
    );

    const savedMessage = await this.chatService.createMessage(data);
    this.emitNewMessage(savedMessage);

    if (messageCount === 0) {
      const { conversation, adminId } =
        await this.chatService.getConversationById(data.conversationId);
      const conversationPayload = {
        ...conversation,
        lastMessage: savedMessage,
      };
      this.emitNewConversation(conversationPayload, adminId);
    }
  }

  emitNewMessage(message: MessageReponseType) {
    this.logger.log('emitNewMessage', message);
    const room = `conversation_${message.conversationId}`;
    this.logger.log('Emitting to room:', room);
    this.server.to(room).emit(SocketEvent.NEW_MESSAGE, message);
  }

  emitNewConversation(conversation: any, adminId: number) {
    this.logger.log(`emitNewConversation ${JSON.stringify(conversation)}`);
    const adminRoom = `admin_${adminId}`;
    this.logger.log(`Emitting NEW_CONVERSATION to room: ${adminRoom}`);
    this.server.to(adminRoom).emit(SocketEvent.NEW_CONVERSATION, conversation);
  }

  emitProductPriceChangedToAll(productId: string, newPrice: number) {
    this.server.emit(SocketEvent.PRODUCT_PRICE_CHANGED, {
      productId,
      newPrice,
    });
  }
}
