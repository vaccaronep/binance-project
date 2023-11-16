import { Controller } from '@nestjs/common';
import { AccountService } from './services/account.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @MessagePattern({ cmd: 'account_get' })
  getAccount(data: { userId: string }) {
    console.log(data.userId);
    return this.accountService.getAccount();
  }

  @MessagePattern({ cmd: 'account_get_trades' })
  async getAccountTrades(data: { userId: string; tickerId: string }) {
    console.log(data.userId);
    return this.accountService.getAccountTrades(data.tickerId);
  }
}
