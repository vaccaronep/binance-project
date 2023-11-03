import { Controller, HttpStatus } from '@nestjs/common';
import { UserService } from './services/user.service';
import { MessagePattern } from '@nestjs/microservices';
import { IUser } from './interfaces/user.interface';

interface IUserCreateResponse {}

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

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
          userParams.is_confirmed = false;
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
}
