import { Injectable } from '@nestjs/common';
import { IAction, IRule } from '../interfaces/rule.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PythonAnyWhereHttp } from './pythonaw.http.service';

@Injectable()
export class RulesService {
  constructor(
    @InjectModel('Rule') private readonly ruleModel: Model<IRule>,
    @InjectModel('Action') private readonly actionModel: Model<IAction>,
    private readonly pythonHttpService: PythonAnyWhereHttp,
  ) {}

  async getAllRules(
    userId?: string,
    ruleId?: string,
    ticker?: string,
    is_active?: boolean,
    is_future?: boolean,
    strategyId?: number,
    side?: string,
  ): Promise<IRule[]> {
    const conditions = [];

    if (ticker) {
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(ticker || '');
      conditions.push({
        ticker: {
          $exists: true,
          $ne: null,
          $regex: searchRgx,
          $options: 'i',
        },
      });
    }

    if (userId)
      conditions.push({ userId: { $exists: true, $ne: null, $eq: userId } });
    if (ruleId)
      conditions.push({ id: { $exists: true, $ne: null, $eq: ruleId } });
    if (is_active) conditions.push({ is_active });
    if (is_future) conditions.push({ is_future });
    if (strategyId) conditions.push({ strategyId });
    if (side) conditions.push({ side });

    return await this.ruleModel
      .find({
        $and: conditions,
      })
      .populate('actions', '-_id -__v', 'Action')
      .exec();
  }

  async createRule(rule: IRule): Promise<IRule> {
    const actions = rule.actions;
    delete rule.actions;
    const ruleModel = new this.ruleModel(rule);
    await ruleModel.save();

    ruleModel.actions = await Promise.all(
      actions.map((action) => {
        action.rule = ruleModel._id;
        return new this.actionModel(action).save();
      }),
    );

    await ruleModel.save();

    this.pythonHttpService.updateConfiguration({
      ticker: rule.ticker,
      strategyId: rule.strategyId,
      is_futures: rule.is_future,
      pyramiding: rule.pyramiding,
      qty: rule.quantity_trade,
      actual_trade: ruleModel.actual_trade,
      side: rule.side,
    });

    return ruleModel;
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
