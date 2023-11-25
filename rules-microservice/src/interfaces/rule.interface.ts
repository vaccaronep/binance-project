import { Document } from 'mongoose';

export interface IRule extends Document {
  id?: string;
  userId: string;
  ticker: string;
  is_active: boolean;
  is_future: boolean;
  strategyId: string; //tv_id en strategy
  quantity_trade: number;
  pyramiding: number;
  actions: IAction[];
  created_by: string;
}

export interface IAction extends Document {
  rule: IRule;
  type: string;
  percentage: number;
}

export interface IGetAllRulesParams {
  strategyId?: number;
  userId?: string;
  ruleId?: string;
  ticker?: string;
  is_active?: boolean;
  is_future?: boolean;
}
