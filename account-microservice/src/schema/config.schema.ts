import * as mongoose from 'mongoose';

export interface IConfigSchema extends mongoose.Document {
  userId: string;
  is_papper_trading: boolean;
  is_active: boolean;
  is_futures: boolean;
  api_key: string;
  api_secret: string;
  api_url: string;
  ws_url: string;
}

export const ConfigSchema = new mongoose.Schema<IConfigSchema>({
  userId: {
    type: String,
    required: [true, 'Email can not be empty'],
  },
  is_papper_trading: {
    type: Boolean,
    default: false,
    required: [true, 'Is Papper Trading can not be empty'],
  },
  is_futures: {
    type: Boolean,
    default: true,
    required: [true, 'Is Futures can not be empty'],
  },
  is_active: {
    type: Boolean,
    default: true,
    required: [true, 'Active can not be empty'],
  },
  api_key: {
    type: String,
    required: [true, 'Api Key can not be empty'],
  },
  api_secret: {
    type: String,
    required: [true, 'Api Secret can not be empty'],
  },
  api_url: {
    type: String,
    required: [true, 'Api URL can not be empty'],
  },
  ws_url: {
    type: String,
    required: [true, 'WebSocket URL can not be empty'],
  },
});
