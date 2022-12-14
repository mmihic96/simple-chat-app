import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  NotFoundException,
  Query,
  Inject,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { QueryDto } from '../users/dto/users.dto';
import { UsersService } from '../users/users.service';
import { ConversationService } from './conversation.service';
import { SocketService } from './socket.service';

@Controller({ path: 'conversations', version: '1' })
export class ConversationController {
  @Inject(ConversationService)
  private readonly conversationService: ConversationService;

  @Inject(UsersService)
  private readonly usersService: UsersService;

  @Inject(SocketService)
  private readonly socketService: SocketService;

  @Post(':conversationId')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Headers()
    headers: {
      'x-socket-id': string;
      'x-user-id': string;
    },
    @Body() { message }: { message: string },
  ) {
    if (!headers['x-user-id']) {
      throw new NotFoundException('Participant not found');
    }

    if (!message?.trim()) {
      throw new NotFoundException('Message required');
    }

    // If conversation exists, add message to conversation
    const timestamp = new Date().valueOf();
    const sender = await this.usersService.findOne(headers['x-user-id']);

    // Push message to conversation
    await this.conversationService.update(
      {
        _id: new mongoose.Types.ObjectId(conversationId),
      },
      {
        $push: {
          messages: {
            message,
            timestamp,
            sender: headers['x-user-id'],
            isSeen: false,
          },
        },
      },
    );

    // Send message to all users in conversation, except the sender
    this.socketService.emit(
      'message',
      { message, timestamp, sender },
      conversationId,
      headers['x-socket-id'],
    );

    // Return conversation
    return { message, timestamp, sender };
  }

  @Post('/typing')
  async typing(
    @Headers() headers: { 'x-socket-id': string },
    @Body() { conversationId }: { conversationId: string },
  ) {
    const sender = await this.usersService.findOne(headers['x-user-id']);

    // Send typing event to all users in conversation, except the sender
    this.socketService.emit(
      'typing',
      { sender },
      conversationId,
      headers['x-socket-id'],
    );
  }

  @Get()
  async findAll(
    @Query() query: QueryDto,
    @Headers()
    headers: {
      'x-user-id': string;
    },
  ) {
    if (!headers['x-user-id']) {
      throw new NotFoundException('Participant not found');
    }
    // Find all conversations for a user (using user id, and message ordered by timestamp)
    const conversations = await this.conversationService.findAll({
      participant: headers['x-user-id'],
      limit: query.limit || 10,
      skip: query.skip || 0,
    });

    // Todo: Join socket room for each conversation (using conversation id)
    for (const conversation of conversations) {
      this.socketService.joinRoom(
        headers['x-socket-id'],
        // @ts-ignore
        conversation._id.toString(),
      );
    }
    // Return conversations
    return conversations;
  }

  @Get(':conversationId')
  async findOne(
    @Param('conversationId') conversationId: string,
    @Query() query: QueryDto,
    @Headers()
    headers: {
      'x-user-id': string;
    },
  ) {
    // Update all messages in conversation to seen where sender is not the user
    await this.conversationService.update(
      {
        _id: new mongoose.Types.ObjectId(conversationId),
        participants: {
          $in: [new mongoose.Types.ObjectId(headers['x-user-id'])],
        },
        'messages.sender': {
          $ne: new mongoose.Types.ObjectId(headers['x-user-id']),
        },
        'messages.isSeen': false,
      },
      {
        $set: {
          'messages.$.isSeen': true,
        },
      },
    );

    const conversation = await this.conversationService.findOne({
      ...query,
      id: conversationId,
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Return conversation
    return conversation;
  }
}
