import * as mongoose from 'mongoose';
import { IActionSchema } from './actions.schema';

export interface IRulesSchema extends mongoose.Document {
  userId: string;
  ticker: string;
  is_active: boolean;
  is_future: boolean;
  strategyId: number;
  quantity_trade: number;
  pyramiding: number;
  type: string;
  actual_trade: number;
  actions: IActionSchema[];
  created_by: string;
  params?: string;
}

export const RuleSchema = new mongoose.Schema<IRulesSchema>(
  {
    strategyId: {
      type: Number,
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
    params: {
      type: String,
      required: [false, 'Params can not be empty'],
    },
    type: {
      type: String,
      enum: ['OCO', 'TRAILING'],
      default: 'OCO',
      required: [true, 'Type can not be empty'],
    },
    quantity_trade: {
      type: Number,
      required: [true, 'Quantity per trade can not be empty'],
    },
    actual_trade: {
      type: Number,
      default: 0,
    },
    pyramiding: {
      type: Number,
      required: [true, 'Pyramiding can not be empty'],
    },
    actions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Action',
      },
    ],
    created_by: {
      type: String,
      required: [true, 'Created By can not be empty'],
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
