import { Document } from 'mongoose';

export interface IConfig extends Document {
  userId: string;
  is_papper_trading: boolean;
  is_futures: boolean;
  is_active: boolean;
  api_key: string;
  api_secret: string;
}
