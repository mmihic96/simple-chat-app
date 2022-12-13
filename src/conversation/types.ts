import mongoose from 'mongoose';

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  message: string;
  isSeen: boolean;
  timestamp: Number;
}
