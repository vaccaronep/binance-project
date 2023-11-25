import * as mongoose from 'mongoose';
import { IRulesSchema } from './rules.schema';

export interface IActionSchema extends mongoose.Document {
  type: string;
  percentage: string;
  rule: IRulesSchema;
}

export const ActionSchema = new mongoose.Schema<IActionSchema>(
  {
    rule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rule',
    },
    type: {
      type: String,
      required: [true, 'Type can not be empty'],
    },
    percentage: {
      type: String,
      required: [true, 'Percentage per trade can not be empty'],
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
