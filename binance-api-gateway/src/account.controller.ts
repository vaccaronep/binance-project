import { Controller, Get, Inject, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Authorization } from './decorators/auth.decorator';
import { IAuthorizedRequest } from './interfaces/common/authorized-request.interface';

@Controller('account')
@ApiTags('account')
export class AccountController {
  constructor(
    @Inject('ACCOUNT_SERVICE') private readonly accountClient: ClientProxy,
  ) {}

  @Get('')
  @Authorization(true)
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
}
