import { IUser } from './user.interface';

export interface IUsersGetResponse {
  status: number;
  message: string;
  users: IUser[] | null;
  errors: { [key: string]: any } | null;
}

export interface IUserGetResponse {
  status: number;
  message: string;
  user: IUser | null;
  errors?: { [key: string]: any } | null;
}
