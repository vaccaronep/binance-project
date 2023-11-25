import { Document } from 'mongoose';
import { IRule } from './rule.interface';

export interface IStrategy extends Document {
  id?: string;
  name: string;
  is_active: boolean;
  tv_id: number;
  created_by: string;
  rules: IRule[];
}
