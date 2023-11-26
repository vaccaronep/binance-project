import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { ConfirmedStrategyService } from './services/confirmed-strategy.service';

@Module({
  imports: [],
  controllers: [PermissionController],
  providers: [ConfirmedStrategyService],
})
export class AppModule {}
