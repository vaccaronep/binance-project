import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('IDENTITY_SERVICE')
    private readonly identityServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<string[]>(
      'secured',
      context.getHandler(),
    );

    if (!secured) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userTokenInfo = await firstValueFrom(
      this.identityServiceClient.send(
        { cmd: 'token_decode' },
        {
          token: request.headers.authorization,
        },
      ),
    );

    if (!userTokenInfo || !userTokenInfo.data) {
      throw new HttpException(
        {
          message: userTokenInfo.message,
          data: null,
          errors: null,
        },
        userTokenInfo.status,
      );
    }

    const userInfo = await firstValueFrom(
      this.userServiceClient.send(
        { cmd: 'user_get_by_id' },
        userTokenInfo.data.userId,
      ),
    );

    request.user = userInfo.user;
    return true;
  }
}
