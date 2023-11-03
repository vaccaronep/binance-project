import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule.forRoot(), OrdersModule, RedisModule, UsersModule],
  controllers: [AppController],
  providers: [
    AppService,
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
  ],
})
export class AppModule {}
