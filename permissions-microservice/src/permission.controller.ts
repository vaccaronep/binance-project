import { Controller, HttpStatus } from '@nestjs/common';
import { ConfirmedStrategyService } from './services/confirmed-strategy.service';
import { IUser } from './interfaces/user.interface';
import { MessagePattern } from '@nestjs/microservices';
import { IPermissionCheckResponse } from './interfaces/permission-check-response.interface';
import { permissions } from './constants/permissions';

@Controller('permission')
export class PermissionController {
  constructor(private readonly strategyService: ConfirmedStrategyService) {}

  @MessagePattern('permission_check')
  public permissionCheck(permissionParams: {
    user: IUser;
    permission: string;
  }): IPermissionCheckResponse {
    let result: IPermissionCheckResponse;

    if (!permissionParams || !permissionParams.user) {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'permission_check_bad_request',
        errors: null,
      };
    } else {
      if (permissionParams.user.is_admin) {
        result = {
          status: HttpStatus.OK,
          message: 'permission_check_success',
          errors: null,
        };
      } else {
        const allowedPermissions = this.strategyService.getAllowedPermissions(
          permissionParams.user,
          permissions,
        );

        console.log(allowedPermissions);
        const isAllowed = allowedPermissions.includes(
          permissionParams.permission,
        );

        result = {
          status: isAllowed ? HttpStatus.OK : HttpStatus.FORBIDDEN,
          message: isAllowed
            ? 'permission_check_success'
            : 'permission_check_forbidden',
          errors: null,
        };
      }
    }

    return result;
  }
}
