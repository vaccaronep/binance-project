import { Controller, HttpStatus } from '@nestjs/common';
import { IdentityService } from './services/identity.service';
import { MessagePattern } from '@nestjs/microservices';
import { ITokenResponse } from './interfaces/token-response.interface';
import { ITokenDestroyResponse } from './interfaces/token-destroy-response.interface';
import { ITokenDataResponse } from './interfaces/token-data-response.interface';

@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @MessagePattern({ cmd: 'token_create' })
  public async createtoken(data: { userId: string }): Promise<ITokenResponse> {
    let result: ITokenResponse;
    if (data && data.userId) {
      try {
        const createResult = await this.identityService.createtoken(
          data.userId,
        );
        result = {
          status: HttpStatus.CREATED,
          message: 'token_create_success',
          token: createResult.token,
        };
      } catch (e) {
        result = {
          status: HttpStatus.BAD_REQUEST,
          message: 'token_create_bad_request',
          token: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'token_create_bad_request',
        token: null,
      };
    }

    return result;
  }
  @MessagePattern({ cmd: 'token_destroy' })
  public async destroytoken(data: {
    userId: string;
  }): Promise<ITokenDestroyResponse> {
    return {
      status: data && data.userId ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message:
        data && data.userId
          ? (await this.identityService.deleteTokenForUserId(data.userId)) &&
            'token_destroy_success'
          : 'token_destroy_bad_request',
      errors: null,
    };
  }
  @MessagePattern({ cmd: 'token_decode' })
  public async decodetoken(data: {
    token: string;
  }): Promise<ITokenDataResponse> {
    const tokenData = await this.identityService.decodeToken(data.token);
    return {
      status: tokenData ? HttpStatus.OK : HttpStatus.UNAUTHORIZED,
      message: tokenData ? 'token_decode_success' : 'token_decode_unauthorized',
      data: tokenData,
    };
  }
}
