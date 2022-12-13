import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  NotFoundException,
  Query,
} from '@nestjs/common';
import mongoose, { mongo } from 'mongoose';
import { QueryDto } from 'src/users/dto/users.dto';
import { ConversationService } from './conversation.service';

@Controller({ path: 'conversations', version: '1' })
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

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
    // Check if conversation exists, if throw not found error
    const conversation = await this.conversationService.findOne({
      id: conversationId,
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!headers['x-user-id']) {
      throw new NotFoundException('Participant not found');
    }

    if (!message?.trim()) {
      throw new NotFoundException('Message required');
    }

    // If conversation exists, add message to conversation
    conversation.messages.push({
      message: message,
      sender: new mongoose.Types.ObjectId(headers['x-user-id']),
      isSeen: false,
      timestamp: new Date().valueOf(),
    });
    // Update conversation
    await conversation.markModified('messages');
    await conversation.save();
    // TODO: Send message to all users in conversation, except the sender

    // Return conversation
    return conversation;
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
