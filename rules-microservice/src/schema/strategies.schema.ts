import * as mongoose from 'mongoose';

export interface IStrategySchema extends mongoose.Document {
  name: string;
  params: string;
  is_active: boolean;
}

export const StrategySchema = new mongoose.Schema<IStrategySchema>(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    params: {
      type: String,
      required: [true, 'Params can not be empty'],
    },
    is_active: {
      type: Boolean,
      default: true,
      required: [true, 'Active can not be empty'],
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
