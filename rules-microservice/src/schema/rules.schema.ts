import * as mongoose from 'mongoose';

export interface IRulesSchema extends mongoose.Document {
  userId: string;
  ticker: string;
  stop_loss: number;
  take_profit: number;
  is_active: boolean;
  is_future: boolean;
  strategyId: string;
}

export const RuleSchema = new mongoose.Schema<IRulesSchema>(
  {
    strategyId: {
      type: String,
      required: [true, 'StrategyId can not be empty'],
    },
    is_future: {
      type: Boolean,
      default: false,
      required: [true, 'Is Future can not be empty'],
    },
    userId: {
      type: String,
      required: [true, 'UserId can not be empty'],
    },
    ticker: {
      type: String,
      required: [true, 'Ticker can not be empty'],
    },
    is_active: {
      type: Boolean,
      default: true,
      required: [true, 'Active can not be empty'],
    },
    stop_loss: {
      type: Number,
      required: [true, 'Stop Loss can not be empty'],
    },
    take_profit: {
      type: Number,
      required: [true, 'Take Profit can not be empty'],
    },
  },
  {
    toObject: {
      virtuals: true,
      versionKey: false,
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
  },
);
