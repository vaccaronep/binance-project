import { Module } from '@nestjs/common';
import { RulesController } from './rules.controller';
import { RulesService } from './services/rules.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo.config.service';
import { RuleSchema } from './schema/rules.schema';
import { StrategiesController } from './strategies.controller';
import { StrategiesService } from './services/strategies.service';
import { StrategySchema } from './schema/strategies.schema';
import { ActionSchema } from './schema/actions.schema';
import { PythonController } from './python.controller';
import { PythonAnyWhereHttp } from './services/pythonaw.http.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
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
      {
        name: 'Action',
        schema: ActionSchema,
        collection: 'actions',
      },
    ]),
  ],
  controllers: [RulesController, StrategiesController, PythonController],
  providers: [RulesService, StrategiesService, PythonAnyWhereHttp],
})
export class AppModule {}
