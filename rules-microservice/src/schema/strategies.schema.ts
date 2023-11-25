import * as mongoose from 'mongoose';

export interface IStrategySchema extends mongoose.Document {
  name: string;
  is_active: boolean;
  tv_id: number;
  created_by: string;
}

export const StrategySchema = new mongoose.Schema<IStrategySchema>(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    is_active: {
      type: Boolean,
      default: true,
      required: [true, 'Active can not be empty'],
    },
    tv_id: {
      type: Number,
      required: [true, 'Trading View ID can not be empty'],
    },
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
