import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IConfig } from 'src/interfaces/config.interface';
import { Model } from 'mongoose';

@Injectable()
export class DbService {
  constructor(
    @InjectModel('Config') private readonly configModel: Model<IConfig>,
  ) {}

  async setAccountKeys(userId: string, config: IConfig) {
    config.userId = userId;
    const configModel = new this.configModel(config);
    return configModel.save();
  }

  async getAccountKeys(): Promise<IConfig[]> {
    return this.configModel.find({ is_active: true }).exec();
  }

  async getAccountKeysByUser(data: {
    userId: string;
    is_active?: boolean;
    is_futures?: boolean;
    is_papper_trading?: boolean;
  }): Promise<IConfig[]> {
    let conditions = {};
    conditions = { userId: data.userId };
    if (data.is_active) {
      conditions = { ...conditions, is_active: data.is_active };
    }
    if (data.is_futures) {
      conditions = { ...conditions, is_futures: data.is_futures };
    }
    if (data.is_papper_trading) {
      conditions = { ...conditions, is_papper_trading: data.is_papper_trading };
    }
    return this.configModel.find(conditions).exec();
  }
}
