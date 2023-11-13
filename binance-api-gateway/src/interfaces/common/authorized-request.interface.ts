import { IUser } from '../users/user.interface';

export interface IAuthorizedRequest extends Request {
  user?: IUser;
}
