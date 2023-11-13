import { Injectable } from '@nestjs/common';
import { IRule } from '../interfaces/rule.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class RulesService {
  constructor(@InjectModel('Rule') private readonly ruleModel: Model<IRule>) {}

  async getAllRules(
    userId: string,
    ruleId: string,
    ticker: string,
  ): Promise<IRule[]> {
    const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
    const searchRgx = rgx(ticker || '');

    return await this.ruleModel
      .find({
        $or: [
          { userId: { $exists: true, $ne: null, $eq: userId } },
          { ruleId: { $exists: true, $ne: null, $eq: ruleId } },
          {
            ticker: {
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

  async createRule(rule: IRule): Promise<IRule> {
    const ruleModel = new this.ruleModel(rule);
    return await ruleModel.save();
  }

  async getRuleById(ruleId: string): Promise<IRule> {
    const id = new Types.ObjectId(ruleId);
    return await this.ruleModel.findById(id).exec();
  }

  async deactivateRule(ruleId: string): Promise<IRule> {
    const ruleToBeUpdated = await this.getRuleById(ruleId);
    if (!ruleToBeUpdated) return null;
    return await this.ruleModel
      .findByIdAndUpdate(
        ruleToBeUpdated._id,
        {
          is_active: !ruleToBeUpdated.is_active,
        },
        { new: true },
      )
      .exec();
  }
}
