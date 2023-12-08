import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/interfaces/user.interface';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}
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

  public async confirmUser(userId: string): Promise<IUser> {
    const user: IUser = await this.searchUserById(userId);
    if (!user) return null;
    return this.userModel
      .findByIdAndUpdate(
        user._id,
        { is_confirmed: !user.is_confirmed },
        { new: true },
      )
      .exec();
  }

  public async searchUser(params: {
    email?: string;
    is_active?: boolean;
    is_confirmed?: boolean;
  }): Promise<IUser[]> {
    const conditions = [];

    if (params.email) {
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(params.email || '');
      conditions.push({
        email: { $exists: true, $ne: null, $regex: searchRgx, $options: 'i' },
      });
    }

    if (params.is_active) conditions.push({ is_active: params.is_active });
    if (params.is_confirmed)
      conditions.push({ is_confirmed: params.is_confirmed });

    return this.userModel.find({ $and: conditions }).exec();
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
