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

  async getAccountKeysByUser(userId: string): Promise<IConfig> {
    return this.configModel.findOne({ userId }).exec();
  }
}
