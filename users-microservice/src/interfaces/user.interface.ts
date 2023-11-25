import { Document } from 'mongoose';

export interface IUser extends Document {
  id?: string;
  email: string;
  password: string;
  is_confirmed: boolean;
  is_active: boolean;
  wishlist: string[];
  compareEncryptedPassword: (password: string) => boolean;
  getEncryptedPassword: (password: string) => string;
}
