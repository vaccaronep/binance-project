import { Module } from '@nestjs/common';
import { RulesController } from './rules.controller';
import { RulesService } from './services/rules.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo.config.service';
import { RuleSchema } from './schema/rules.schema';
import { StrategiesController } from './strategies.controller';
import { StrategiesService } from './services/strategies.service';
import { StrategySchema } from './schema/strategies.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Rule',
        schema: RuleSchema,
        collection: 'rules',
      },
      {
        name: 'Strategy',
        schema: StrategySchema,
        collection: 'strategies',
      },
    ]),
  ],
  controllers: [RulesController, StrategiesController],
  providers: [RulesService, StrategiesService],
})
export class AppModule {}
