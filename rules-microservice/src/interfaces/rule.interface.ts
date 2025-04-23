import { Document } from 'mongoose';

export interface IRule extends Document {
  id?: string;
  userId: string;
  ticker: string;
  is_active: boolean;
  is_future: boolean;
  strategyId: number; //tv_id en strategy
  quantity_trade: number;
  type: string;
  side: string;
  pyramiding: number;
  actions: IAction[];
  actual_trade: number;
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
  side?: string;
}
