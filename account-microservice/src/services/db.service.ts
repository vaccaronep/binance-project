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
  }): Promise<IConfig[]> {
    let conditions = {};
    conditions = { userId: data.userId };
    if (data.is_active) {
      conditions = { ...conditions, is_active: data.is_active };
    }
    return this.configModel.find(conditions).exec();
  }
}
