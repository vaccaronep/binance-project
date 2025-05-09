import {
  Body,
  Controller,
  Get,
  Put,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/interfaces/users/dto/create.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Authorization } from './decorators/auth.decorator';
import { ITokenCreateResponse } from './interfaces/identity/token-create.interface';
import { LogoutUserResponseDto } from './interfaces/users/dto/logout.dto';
import { IAuthorizedRequest } from './interfaces/common/authorized-request.interface';
import { IServiceTokenDestroyResponse } from './interfaces/identity/token-destroy.interface';
import { GetUsersResponseDto } from './interfaces/users/dto/get-all-users.dto';
import { Permission } from './decorators/permission.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('IDENTITY_SERVICE')
    private readonly identityServiceClient: ClientProxy,
  ) {}

  @Post('/createuser')
  async createuser(@Body() userRequest: CreateUserDto) {
    const userMicroserviceResponse: any = await firstValueFrom(
      this.userServiceClient.send({ cmd: 'user_create' }, userRequest),
    );

    if (userMicroserviceResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: userMicroserviceResponse.message,
          data: null,
          errors: userMicroserviceResponse.errors,
        },
        userMicroserviceResponse.status,
      );
    }

    const createTokenResponse: ITokenCreateResponse = await firstValueFrom(
      this.identityServiceClient.send(
        { cmd: 'token_create' },
        {
          userId: userMicroserviceResponse.user.id,
        },
      ),
    );

    return {
      message: userMicroserviceResponse.message,
      data: {
        user: userMicroserviceResponse.user,
        token: createTokenResponse.token,
      },
      errors: null,
    };
  }

  @Get('/all')
  @Authorization(true)
  @Permission('users_get_all')
  @ApiOkResponse({
    type: GetUsersResponseDto,
    description: 'List of users for signed in user',
  })
  async getallusers() {
    const userMicroserviceResponse: any = await firstValueFrom(
      this.userServiceClient.send(
        { cmd: 'users_get_all' },
        { is_active: true },
      ),
    );

    return {
      message: userMicroserviceResponse.message,
      data: {
        users: userMicroserviceResponse.users,
      },
      errors: userMicroserviceResponse.errors,
    };
  }

  @Post('/login')
  async login(@Body() { email, password }: CreateUserDto) {
    const userMicroserviceResponse: any = await firstValueFrom(
      this.userServiceClient.send(
        { cmd: 'user_login' },
        {
          email,
          password,
        },
      ),
    );

    if (userMicroserviceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: userMicroserviceResponse.message,
          data: null,
          errors: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const createTokenResponse: ITokenCreateResponse = await firstValueFrom(
      this.identityServiceClient.send(
        { cmd: 'token_create' },
        {
          userId: userMicroserviceResponse.user.id,
        },
      ),
    );

    return {
      message: createTokenResponse.message,
      data: {
        token: createTokenResponse.token,
        user: userMicroserviceResponse.user,
      },
      errors: null,
    };
  }

  @Put('/logout')
  @Authorization(true)
  @ApiCreatedResponse({
    type: LogoutUserResponseDto,
  })
  public async logoutUser(
    @Req() request: IAuthorizedRequest,
  ): Promise<LogoutUserResponseDto> {
    const userInfo = request.user;
    const destroyTokenResponse: IServiceTokenDestroyResponse =
      await firstValueFrom(
        this.identityServiceClient.send(
          { cmd: 'token_destroy' },
          {
            userId: userInfo.id,
          },
        ),
      );

    if (destroyTokenResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: destroyTokenResponse.message,
          data: null,
          errors: destroyTokenResponse.errors,
        },
        destroyTokenResponse.status,
      );
    }

    return {
      message: destroyTokenResponse.message,
      errors: null,
      data: null,
    };
  }

  @Put('/favourites')
  @Authorization(true)
  public async favourites(
    @Req() request: IAuthorizedRequest,
    @Body() body: { ticker: string },
  ): Promise<LogoutUserResponseDto> {
    const userInfo = request.user;
    const favouritesResponse: any = await firstValueFrom(
      this.userServiceClient.send(
        { cmd: 'user_favourites' },
        {
          userId: userInfo.id,
          ticker: body.ticker,
        },
      ),
    );

    if (favouritesResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: favouritesResponse.message,
          data: null,
          errors: favouritesResponse.errors,
        },
        favouritesResponse.status,
      );
    }

    return {
      message: favouritesResponse.message,
      errors: null,
      data: favouritesResponse.user,
    };
  }

  @Put('/deactivate')
  @Authorization(true)
  async deactivate(@Body() { id }: any) {
    const userMicroserviceResponse: any = await firstValueFrom(
      this.userServiceClient.send(
        { cmd: 'user_deactivate' },
        {
          id,
        },
      ),
    );
    return {
      response: userMicroserviceResponse,
    };
  }

  @Put('/confirm')
  @Authorization(true)
  async confirm(@Req() request: IAuthorizedRequest) {
    const id = request.user.id;
    const userMicroserviceResponse: any = await firstValueFrom(
      this.userServiceClient.send(
        { cmd: 'user_confirm' },
        {
          id,
        },
      ),
    );
    return {
      response: userMicroserviceResponse,
    };
  }
}
