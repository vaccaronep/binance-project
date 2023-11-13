import { Document } from 'mongoose';

export interface IStrategy extends Document {
  id?: string;
  name: string;
  params: string;
  is_active: boolean;
}
