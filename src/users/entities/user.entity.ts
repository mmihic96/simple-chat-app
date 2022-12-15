import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum OnlineStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

@Schema({})
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  profileImageUrl: string;

  @Prop({ enum: OnlineStatus, default: OnlineStatus.OFFLINE })
  status: OnlineStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);
