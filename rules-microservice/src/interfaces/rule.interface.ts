import { Document } from 'mongoose';

export interface IRule extends Document {
  id?: string;
  userId: string;
  ticker: string;
  take_profit: number;
  stop_loss: number;
  is_active: boolean;
  is_future: boolean;
  strategyId: string;
}

export interface IGetAllRulesParams {
  strategyId?: string;
  userId?: string;
  ruleId?: string;
  ticker?: string;
}
