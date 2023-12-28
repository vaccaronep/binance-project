import * as mongoose from 'mongoose';

export interface IConfigSchema extends mongoose.Document {
  name: string;
  userId: string;
  is_papper_trading: boolean;
  is_active: boolean;
  is_futures: boolean;
  api_key: string;
  api_secret: string;
  api_url: string;
  ws_url: string;
  account_activated: boolean;
  orders_activated: boolean;
  market_activated: boolean;
}

export const ConfigSchema = new mongoose.Schema<IConfigSchema>({
  name: {
    type: String,
    required: [true, 'Name can not be empty'],
  },
  userId: {
    type: String,
    required: [true, 'UserId can not be empty'],
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
  account_activated: {
    type: Boolean,
    default: false,
  },
  orders_activated: {
    type: Boolean,
    default: false,
  },
  market_activated: {
    type: Boolean,
    default: false,
  },
});
