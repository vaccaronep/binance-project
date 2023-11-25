import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/interfaces/user.interface';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserService {
  public async deactivateUser(userId: string): Promise<IUser> {
    const user: IUser = await this.searchUserById(userId);
    if (!user) return null;
    return this.userModel
      .findByIdAndUpdate(
        user._id,
        { is_active: !user.is_active },
        { new: true },
      )
      .exec();
  }
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  public async searchUser(params: { email: string }): Promise<IUser[]> {
    const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
    const searchRgx = rgx(params.email || '');

    return this.userModel.find({
      $or: [
        {
          email: { $exists: true, $ne: null, $regex: searchRgx, $options: 'i' },
        },
      ],
    });
  }

  public async createUser(user: IUser): Promise<IUser> {
    if (!user.wishlist) {
      user.wishlist = ['EHTUSDT', 'BTCUSDT', 'BNBUSDT'];
    }
    const userModel = new this.userModel(user);
    return await userModel.save();
  }

  public async searchUserById(userId: string): Promise<IUser> {
    const id = new Types.ObjectId(userId);
    return await this.userModel.findById(id).exec();
  }
}
