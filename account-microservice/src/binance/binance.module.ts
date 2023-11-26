import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BinanceHttpService } from './binance.http.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from 'src/redis/redis.module';
import { BinanceWsWrapper } from './binance.ws';
import { DbService } from 'src/services/db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigSchema } from 'src/schema/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    RedisModule,
    MongooseModule.forFeature([
      {
        name: 'Config',
        schema: ConfigSchema,
        collection: 'config',
      },
    ]),
  ],
  providers: [BinanceHttpService, ConfigService, BinanceWsWrapper, DbService],
  exports: [BinanceHttpService, BinanceWsWrapper],
})
export class BinanceModule {}
