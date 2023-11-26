import { forbiddenPermissions } from 'src/constants/permissions';
import { IPermissionStrategy } from '../interfaces/permission-strategy.interface';
import { IUser } from '../interfaces/user.interface';

export class ConfirmedStrategyService implements IPermissionStrategy {
  public getAllowedPermissions(user: IUser, permissions: string[]): string[] {
    return user.is_confirmed && user.is_active
      ? permissions
      : permissions.filter((permission: string) => {
          return !forbiddenPermissions.includes(permission);
        });
  }
}
