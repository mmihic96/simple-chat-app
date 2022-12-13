import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { IMessage } from '../types';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema()
export class Conversation {
  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User', required: true }],
  })
  participants: User[];

  @Prop({ default: [] })
  messages: IMessage[];

  @Prop({ default: Date.now })
  time: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
