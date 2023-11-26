import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/interfaces/user.interface';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @Inject('ACCOUNT_SERVICE') private readonly accountClient: ClientProxy,
  ) {}

  public async enableAccount(user: IUser): Promise<IUser> {
    try {
      const userUpdated = await this.userModel
        .findByIdAndUpdate(
          user._id,
          {
            account_activated: !user.account_activated,
          },
          { new: true },
        )
        .exec();

      if (userUpdated.account_activated) {
        this.accountClient.emit(
          { cmd: 'account_add_ws_user' },
          { userId: user._id },
        );
      } else {
        this.accountClient.emit(
          { cmd: 'account_remove_ws_user' },
          { userId: user._id },
        );
      }

      return userUpdated;
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  public async enableOrder(user: IUser): Promise<IUser> {
    return this.userModel
      .findByIdAndUpdate(
        user._id,
        {
          orders_activated: !user.orders_activated,
        },
        { new: true },
      )
      .exec();
  }
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
