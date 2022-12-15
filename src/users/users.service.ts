import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { QueryDto } from './dto/users.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  @InjectModel(User.name)
  private userModel: Model<UserDocument>;

  findAll(query: QueryDto) {
    const limit = query.limit || 10;
    const skip = query.skip || 0;
    return this.userModel
      .aggregate([{ $limit: limit }, { $skip: skip }])
      .exec();
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  update(id: string, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { ...data },
      { new: true },
    );
  }
}
