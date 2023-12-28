import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/interfaces/user.interface';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @Inject('MARKET_SERVICE') private readonly marketClient: ClientProxy,
  ) {}
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

  public async updateFavourites(user: IUser, ticker: string) {
    const wishlist = new Set(user.wishlist || []);
    wishlist.has(ticker) ? wishlist.delete(ticker) : wishlist.add(ticker);

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        user._id,
        { wishlist: Array.from(wishlist) },
        { new: true },
      )
      .exec();

    let command = '';
    wishlist.has(ticker)
      ? (command = 'market_add_ticker_to_ws')
      : (command = 'market_remove_ticker_to_ws');

    this.marketClient.emit(
      { cmd: command },
      { userId: user._id, ticker: ticker },
    );

    return updatedUser;
  }

  public async searchUser(params: {
    email?: string;
    is_active?: boolean;
    is_confirmed?: boolean;
    userId?: string;
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

    if (params.userId) conditions.push({ _id: params.userId });

    let andClause = {};
    if (conditions.length) {
      andClause = {
        $and: conditions,
      };
    }

    return this.userModel.find(andClause).exec();
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
