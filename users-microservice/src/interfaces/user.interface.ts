import { Document } from 'mongoose';

export interface IUser extends Document {
  id?: string;
  email: string;
  password: string;
  is_confirmed: boolean;
  is_active: boolean;
  is_admin: boolean;
  wishlist: string[];
  account_activated: boolean;
  orders_activated: boolean;
  compareEncryptedPassword: (password: string) => boolean;
  getEncryptedPassword: (password: string) => string;
}
