import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Authorization } from './decorators/auth.decorator';
import { IAuthorizedRequest } from './interfaces/common/authorized-request.interface';
import { Permission } from './decorators/permission.decorator';

@Controller('account')
@ApiTags('account')
export class AccountController {
  constructor(
    @Inject('ACCOUNT_SERVICE') private readonly accountClient: ClientProxy,
  ) {}

  @Post('/enableaccount')
  @Authorization(true)
  @Permission('user_enable_account')
  async enableaccount(
    @Req() request: IAuthorizedRequest,
    @Query('configId') configId: string,
  ) {
    const userId = request.user.id;
    const accountMicroserviceResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'config_enable_account' },
        { userId, configId },
      ),
    );

    if (accountMicroserviceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: accountMicroserviceResponse.message,
          data: null,
          errors: accountMicroserviceResponse.errors,
        },
        accountMicroserviceResponse.status,
      );
    }

    return {
      message: accountMicroserviceResponse.message,
      data: {
        configs: accountMicroserviceResponse.configs,
      },
      errors: null,
    };
  }

  @Post('/enableorders')
  @Authorization(true)
  @Permission('user_enable_order')
  async enableorders(
    @Req() request: IAuthorizedRequest,
    @Query('configId') configId: string,
  ) {
    const userId = request.user.id;
    const accountMicroserviceResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'config_enable_order' },
        { userId, configId },
      ),
    );

    if (accountMicroserviceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: accountMicroserviceResponse.message,
          data: null,
          errors: accountMicroserviceResponse.errors,
        },
        accountMicroserviceResponse.status,
      );
    }

    return {
      message: accountMicroserviceResponse.message,
      data: {
        configs: accountMicroserviceResponse.configs,
      },
      errors: null,
    };
  }

  @Get('')
  @Authorization(true)
  @Permission('account_get')
  public async accounts(
    @Req() request: IAuthorizedRequest,
    @Query('configId') configId: string,
  ): Promise<any> {
    const userInfo = request.user;
    const accountGetnResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_get' },
        {
          userId: userInfo.id,
          configId,
        },
      ),
    );

    if (accountGetnResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: accountGetnResponse.message,
          data: null,
          errors: accountGetnResponse.errors,
        },
        accountGetnResponse.status,
      );
    }

    return {
      message: accountGetnResponse.message,
      data: {
        account: accountGetnResponse.account,
      },
      errors: null,
    };
  }

  @Get('/mine')
  @Authorization(true)
  public async configByUser(@Req() request: IAuthorizedRequest): Promise<any> {
    const userId = request.user.id;
    const confignResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_get_keys' },
        {
          userId,
        },
      ),
    );

    if (confignResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confignResponse.message,
          data: null,
          errors: confignResponse.errors,
        },
        confignResponse.status,
      );
    }

    return {
      message: confignResponse.message,
      data: {
        configs: confignResponse.configs,
      },
      errors: null,
    };
  }

  @Get('/config')
  @Authorization(true)
  public async configById(
    @Req() request: IAuthorizedRequest,
    @Query('id') id: string,
  ): Promise<any> {
    const confignResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_get_keys_by_id' },
        {
          configId: id,
        },
      ),
    );

    if (confignResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confignResponse.message,
          data: null,
          errors: confignResponse.errors,
        },
        confignResponse.status,
      );
    }

    return {
      message: confignResponse.message,
      data: {
        configs: confignResponse.configs,
      },
      errors: null,
    };
  }

  @Delete('/config/all')
  @Authorization(true)
  public async deactivateUsersConfig(
    @Req() request: IAuthorizedRequest,
  ): Promise<any> {
    const userId = request.user.id;
    const confignResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_disable' },
        {
          userId,
        },
      ),
    );

    if (confignResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confignResponse.message,
          data: null,
          errors: confignResponse.errors,
        },
        confignResponse.status,
      );
    }

    return {
      message: confignResponse.message,
      data: {
        configs: confignResponse.configs,
      },
      errors: null,
    };
  }

  @Delete('/config')
  @Authorization(true)
  public async deactivateConfig(
    @Req() request: IAuthorizedRequest,
    @Query('id') id: string,
  ): Promise<any> {
    const confignResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_disable' },
        {
          configId: id,
        },
      ),
    );

    if (confignResponse.status !== HttpStatus.ACCEPTED) {
      throw new HttpException(
        {
          message: confignResponse.message,
          data: null,
          errors: confignResponse.errors,
        },
        confignResponse.status,
      );
    }

    return {
      message: confignResponse.message,
      data: {
        configs: confignResponse.configs,
      },
      errors: null,
    };
  }

  @Get('/trades')
  @Authorization(true)
  @Permission('account_get_trades')
  public async accountTrades(
    @Req() request: IAuthorizedRequest,
    @Query('ticker') ticker: string,
  ): Promise<any> {
    const userInfo = request.user;
    const destroyTokenResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_get_trades' },
        {
          userId: userInfo.id,
          tickerId: ticker,
        },
      ),
    );

    return {
      errors: null,
      data: destroyTokenResponse,
    };
  }

  @Post('/set_keys')
  @Authorization(true)
  @Permission('account_set_keys')
  public async accountSetKeys(
    @Req() request: IAuthorizedRequest,
    @Body()
    body: {
      is_papper_trading: boolean;
      is_futures: boolean;
      is_active: boolean;
      api_key: string;
      api_secret: string;
      api_url: string;
      ws_url: string;
    },
  ): Promise<any> {
    const userInfo = request.user;
    const setAccountKeysResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_set_keys' },
        {
          userId: userInfo.id,
          config: body,
        },
      ),
    );

    return {
      errors: null,
      data: setAccountKeysResponse,
    };
  }

  @Put('/set_keys')
  @Authorization(true)
  public async accountUpdateKeys(
    @Query('id') id: string,
    @Body()
    body: {
      is_papper_trading: boolean;
      is_futures: boolean;
      is_active: boolean;
      api_key: string;
      api_secret: string;
      api_url: string;
      ws_url: string;
    },
  ): Promise<any> {
    const setAccountKeysResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_update' },
        {
          configId: id,
          config: body,
        },
      ),
    );

    return {
      errors: null,
      data: setAccountKeysResponse,
    };
  }
}
