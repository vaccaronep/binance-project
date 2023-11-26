import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
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

  @Get('')
  @Authorization(true)
  @Permission('account_get')
  public async accounts(@Req() request: IAuthorizedRequest): Promise<any> {
    const userInfo = request.user;
    const destroyTokenResponse: any = await firstValueFrom(
      this.accountClient.send(
        { cmd: 'account_get' },
        {
          userId: userInfo.id,
        },
      ),
    );

    return {
      errors: null,
      data: destroyTokenResponse,
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
}
