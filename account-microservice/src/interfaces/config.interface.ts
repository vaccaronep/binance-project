import { Document } from 'mongoose';

export interface IConfig extends Document {
  name: string;
  userId: string;
  is_papper_trading: boolean;
  is_futures: boolean;
  is_active: boolean;
  api_key: string;
  api_secret: string;
  api_url: string;
  ws_url: string;
  account_activated: boolean;
  orders_activated: boolean;
}
