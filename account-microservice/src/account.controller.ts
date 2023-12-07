import { Controller } from '@nestjs/common';
import { AccountService } from './services/account.service';
import { MessagePattern } from '@nestjs/microservices';
import { IConfig } from './interfaces/config.interface';
import { DbService } from './services/db.service';
import { BinanceWsWrapper } from './binance/binance.ws';

@Controller()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly dbService: DbService,
    private readonly wsService: BinanceWsWrapper,
  ) {}

  @MessagePattern({ cmd: 'account_get' })
  getAccount(data: { userId: string }) {
    console.log(data.userId);
    return this.accountService.getAccount();
  }

  @MessagePattern({ cmd: 'account_get_trades' })
  async getAccountTrades(data: { userId: string; tickerId: string }) {
    return this.accountService.getAccountTrades(data.tickerId);
  }

  @MessagePattern({ cmd: 'account_set_keys' })
  async setAccountKeys(data: { userId: string; config: IConfig }) {
    return this.dbService.setAccountKeys(data.userId, data.config);
  }

  @MessagePattern({ cmd: 'account_get_keys' })
  async getAccountKeys(data: { userId: string }) {
    console.log(data.userId);
    return this.dbService.getAccountKeysByUser({
      userId: data.userId,
      is_active: true,
    });
  }

  @MessagePattern({ cmd: 'account_add_ws_user' })
  async addUserToWs(data: { userId: string }) {
    console.log('recibiendo mensaje:' + data.userId);
    this.wsService.connectNewWs(data.userId);
  }

  @MessagePattern({ cmd: 'account_remove_ws_user' })
  async removeUserToWs(data: { userId: string }) {
    console.log('recibiendo mensaje:' + data.userId);
    this.wsService.removeNewWs(data.userId);
  }
}
