import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './services/account.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo.config.service';
import { ConfigSchema } from './schema/config.schema';
import { BinanceModule } from './binance/binance.module';
import { DbService } from './services/db.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BinanceModule,
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Config',
        schema: ConfigSchema,
        collection: 'config',
      },
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService, ConfigService, DbService],
})
export class AccountModule {}
