import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IStrategy } from 'src/interfaces/strategy.interface';

@Injectable()
export class StrategiesService {
  constructor(
    @InjectModel('Strategy') private readonly strategyModel: Model<IStrategy>,
  ) {}

  async getAllStrategies(data: { name: string }): Promise<IStrategy[]> {
    const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
    const searchRgx = rgx(data.name || '');

    return await this.strategyModel
      .find({
        $or: [
          {
            name: {
              $exists: true,
              $ne: null,
              $regex: searchRgx,
              $options: 'i',
            },
          },
        ],
      })
      .exec();
  }

  async createStrategy(strategy: IStrategy): Promise<IStrategy> {
    const strategyModel: IStrategy = new this.strategyModel(strategy);
    return await strategyModel.save();
  }

  async getStrategyById(strategyId: string): Promise<IStrategy> {
    const id = new Types.ObjectId(strategyId);
    return await this.strategyModel.findById(id);
  }

  async deactivateStrategy(strategyId: string): Promise<IStrategy> {
    const strategy = await this.getStrategyById(strategyId);
    if (!strategy) return null;
    return await this.strategyModel
      .findByIdAndUpdate(
        strategy._id,
        {
          is_active: !strategy.is_active,
        },
        { new: true },
      )
      .exec();
  }
}
