import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Aggregate, Model } from 'mongoose';
import { QueryConversationDto } from './dto/conversation.dto';
import {
  Conversation,
  ConversationDocument,
} from './entities/conversation.entity';

@Injectable()
export class ConversationService {
  @InjectModel(Conversation.name)
  private readonly conversationModel: Model<ConversationDocument>;

  findAll({
    participant,
    skip,
    limit,
  }: QueryConversationDto): Aggregate<Conversation[]> {
    return this.conversationModel
      .aggregate([
        {
          $match: {
            participants: {
              $in: [new mongoose.Types.ObjectId(participant)],
            },
          },
        },
        {
          $set: {
            messages: {
              $sortArray: {
                input: '$messages',
                sortBy: { timestamp: -1 },
              },
            },
          },
        },
        {
          $project: {
            messages: {
              $slice: ['$messages', 0, 1],
            },
          },
        },
      ])
      .limit(limit)
      .skip(skip)
      .collation({ locale: 'en', strength: 1 });
  }

  async findOne({ id, skip = 0, limit = 1 }: QueryConversationDto) {
    const aggregate = await this.conversationModel
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $set: {
            messages: {
              $sortArray: {
                input: '$messages',
                sortBy: { timestamp: -1 },
              },
            },
          },
        },
        {
          $project: {
            messages: {
              $slice: ['$messages', skip, limit],
            },
          },
        },
      ])
      .collation({ locale: 'en', strength: 1 });

    return aggregate[0];
  }

  updateMany(match: any, update: any) {
    return this.conversationModel.updateMany(match, update).exec();
  }

  update(match: any, update: any) {
    return this.conversationModel.updateOne(match, update).exec();
  }
}
