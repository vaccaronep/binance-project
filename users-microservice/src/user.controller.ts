import { Controller, HttpStatus } from '@nestjs/common';
import { UserService } from './services/user.service';
import { MessagePattern } from '@nestjs/microservices';
import { IUser } from './interfaces/user.interface';
import {
  IUsersGetResponse,
  IUserGetResponse,
} from './interfaces/user-get-users-response.interface';
import { IUserCreateResponse } from './interfaces/user-create-response.interface';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'user_enable_account' })
  public async enableAccountWsToUser(
    userId: string,
  ): Promise<IUserGetResponse> {
    let result: IUserGetResponse;
    if (userId) {
      try {
        const user = await this.userService.searchUserById(userId);
        if (!user) {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'user_enable_account_user_not_found',
            user: null,
            errors: null,
          };
        }
        const updatedUser = await this.userService.enableAccount(user);
        result = {
          status: HttpStatus.OK,
          message: 'user_enable_account_user_success',
          user: updatedUser,
          errors: null,
        };
      } catch (e) {
        console.log(e);
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'user_create_precondition_failed',
          user: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_enable_account',
        user: null,
        errors: null,
      };
    }
    return result;
  }
  @MessagePattern({ cmd: 'user_enable_order' })
  public async enableOrderWsToUser(userId: string): Promise<IUserGetResponse> {
    let result: IUserGetResponse;
    if (userId) {
      try {
        const user = await this.userService.searchUserById(userId);
        if (!user) {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'user_enable_order_user_not_found',
            user: null,
            errors: null,
          };
        }
        const updatedUser = await this.userService.enableOrder(user);
        result = {
          status: HttpStatus.OK,
          message: 'user_enable_order_success',
          user: updatedUser,
          errors: null,
        };
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'user_enable_order_failed',
          user: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_enable_order',
        user: null,
        errors: null,
      };
    }
    return result;
  }

  @MessagePattern({ cmd: 'user_create' })
  public async createUser(userParams: IUser): Promise<IUserCreateResponse> {
    let result: IUserCreateResponse;

    if (userParams) {
      const usersWithEmail = await this.userService.searchUser({
        email: userParams.email,
      });

      if (usersWithEmail && usersWithEmail.length > 0) {
        result = {
          status: HttpStatus.CONFLICT,
          message: 'user_create_conflict',
          user: null,
          errors: {
            email: {
              message: 'Email already exists',
              path: 'email',
            },
          },
        };
      } else {
        try {
          userParams.is_active = false;
          const createdUser = await this.userService.createUser(userParams);
          delete createdUser.password;
          result = {
            status: HttpStatus.CREATED,
            message: 'user_create_success',
            user: createdUser,
            errors: null,
          };
        } catch (e) {
          result = {
            status: HttpStatus.PRECONDITION_FAILED,
            message: 'user_create_precondition_failed',
            user: null,
            errors: e.errors,
          };
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_create_bad_request',
        user: null,
        errors: null,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'users_get_all' })
  public async getAllUsers(data: {
    email?: string;
    is_active?: boolean;
    is_confirmed?: boolean;
    account_activated: boolean;
  }): Promise<IUsersGetResponse> {
    let result: IUsersGetResponse;
    try {
      const users = await this.userService.searchUser(data);
      // eslint-disable-next-line prefer-const
      result = {
        status: HttpStatus.OK,
        message: 'user_get_all_success',
        errors: null,
        users,
      };
    } catch (error) {
      result = {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'users_get_all_failed',
        users: null,
        errors: error.errors,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'user_login' })
  public async loginUser(userParams: IUser): Promise<IUserGetResponse> {
    let result: IUserGetResponse;

    if (userParams.email && userParams.password) {
      const user = await this.userService.searchUser({
        email: userParams.email,
      });

      if (user && user[0]) {
        if (await user[0].compareEncryptedPassword(userParams.password)) {
          result = {
            status: HttpStatus.OK,
            message: 'user_search_by_credentials_success',
            user: user[0],
          };
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'user_search_by_credentials_not_match',
            user: null,
          };
        }
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_search_by_credentials_not_found',
          user: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.NOT_FOUND,
        message: 'user_search_by_credentials_not_found',
        user: null,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'user_get_by_id' })
  public async getUserById(userId: string) {
    let result: IUserGetResponse;

    if (userId) {
      const user = await this.userService.searchUserById(userId);
      if (user) {
        result = {
          status: HttpStatus.OK,
          message: 'user_get_by_id_success',
          user,
        };
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_get_by_id_not_found',
          user: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_get_by_id_bad_request',
        user: null,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'user_deactivate' })
  public async deactiveUser(userId: string) {
    if (userId) {
      const user = await this.userService.deactivateUser(userId);
      if (user) {
        return {
          status: HttpStatus.OK,
          message: 'user_deactivate_success',
          user,
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'user_deactivate_not_found',
          user: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_deactivate_bad_request',
        user: null,
      };
    }
  }

  @MessagePattern({ cmd: 'user_confirm' })
  public async confirmUser(userId: string) {
    if (userId) {
      const user = await this.userService.confirmUser(userId);
      if (user) {
        if (user.is_confirmed) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'user_confirm_user_already_confirmed',
            user: null,
          };
        } else {
          return {
            status: HttpStatus.OK,
            message: 'user_confirm_success',
            user,
          };
        }
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'user_confirm_not_found',
          user: null,
        };
      }
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_confirm_bad_request',
        user: null,
      };
    }
  }
}
