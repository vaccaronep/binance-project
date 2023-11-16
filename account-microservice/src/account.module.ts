import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './services/account.service';
import { BinanceModule } from './binance/binance.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [BinanceModule],
  controllers: [AccountController],
  providers: [AccountService, ConfigService],
})
export class AccountModule {}
