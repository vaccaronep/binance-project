import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './services/account.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo.config.service';
import { ConfigSchema } from './schema/config.schema';
import { BinanceModule } from './binance/binance.module';
import { DbService } from './services/db.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

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
  providers: [
    AccountService,
    ConfigService,
    DbService,
    {
      provide: 'USERS_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('USERS_SERVICE_HOST'),
            port: configService.get('USERS_SERVICE_PORT'),
          },
        });
      },
    },
    {
      provide: 'ORDERS_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('ORDERS_SERVICE_HOST'),
            port: configService.get('ORDERS_SERVICE_PORT'),
          },
        });
      },
    },
    {
      provide: 'MARKET_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('MARKET_SERVICE_HOST'),
            port: configService.get('MARKET_SERVICE_PORT'),
          },
        });
      },
    },
  ],
})
export class AccountModule {}
