import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [OrdersController],
  providers: [
    OrdersService,
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
  ],
})
export class OrdersModule {}
