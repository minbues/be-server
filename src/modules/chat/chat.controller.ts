import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '../../utils/enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { SocketGateway } from '../wss/socket.gateway';

@ApiTags('Chat')
@Controller({
  path: 'chat',
  version: '1',
})
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly socketGateway: SocketGateway,
  ) {}

  // Tạo hoặc lấy cuộc trò chuyện
  @ApiBearerAuth()
  @Roles(RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('conversation')
  async getOrCreateConversation(@Req() req: any) {
    const userId = req.user.id;
    return await this.chatService.getOrCreateConversation(userId);
  }

  // Lấy tin nhắn trong cuộc trò chuyện
  // @ApiBearerAuth()
  // @Roles(RoleEnum.USER)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  // Gửi tin nhắn
  @ApiBearerAuth()
  @Roles(RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('messages')
  async sendMessage(
    @Body()
    body: {
      conversationId: string;
      senderId: number;
      content: string;
    },
  ) {
    const savedMessage = await this.chatService.createMessage({
      ...body,
    });

    this.socketGateway.emitNewMessage(savedMessage);

    return savedMessage;
  }

  // @Roles(RoleEnum.ADMIN)
  @Get('conversations')
  async getAllConversations() {
    return this.chatService.getAllConversations();
  }
}
