import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RedisModule } from './redis/redis.module';
import { OrdersController } from './orders.controller';
import { RulesController } from './rules.controller';
import { UsersController } from './users.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { StrategiesController } from './strategies.controller';
import { AccountController } from './account.controller';

@Module({
  imports: [ConfigModule.forRoot(), RedisModule],
  controllers: [
    OrdersController,
    RulesController,
    UsersController,
    StrategiesController,
    AccountController,
  ],
  providers: [
    {
      provide: 'ACCOUNT_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('ACCOUNT_SERVICE_HOST'),
            port: configService.get('ACCOUNT_SERVICE_PORT'),
          },
        });
      },
    },
    {
      provide: 'USER_SERVICE',
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
      provide: 'RULES_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('RULES_SERVICE_HOST'),
            port: configService.get('RULES_SERVICE_PORT'),
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
      provide: 'IDENTITY_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('IDENTITY_SERVICE_HOST'),
            port: configService.get('IDENTITY_SERVICE_PORT'),
          },
        });
      },
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionGuard,
    // },
  ],
})
export class AppModule {}
