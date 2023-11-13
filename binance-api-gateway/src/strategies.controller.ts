import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Authorization } from './decorators/auth.decorator';
import { CreateStrategyDto } from './interfaces/strategies/create.strategy.dto';

@Controller('strategies')
@ApiTags('strategies')
export class StrategiesController {
  constructor(
    @Inject('RULES_SERVICE') private readonly rulesMicroService: ClientProxy,
  ) {}

  @Post()
  @Authorization(true)
  async createStrategy(@Body() strategyRequest: CreateStrategyDto) {
    const strategyMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send({ cmd: 'strategy_create' }, strategyRequest),
    );

    if (strategyMicroServiceResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: strategyMicroServiceResponse.message,
          data: null,
          errors: strategyMicroServiceResponse.errors,
        },
        strategyMicroServiceResponse.status,
      );
    }
    return {
      message: strategyMicroServiceResponse.message,
      data: {
        strategy: strategyMicroServiceResponse.strategy,
      },
      errors: null,
    };
  }

  @Get('/all')
  @Authorization(true)
  async getAllStrategies(@Query('name') name?: string) {
    const strategyMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send({ cmd: 'strategy_get_all' }, { name }),
    );

    if (strategyMicroServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: strategyMicroServiceResponse.message,
          data: null,
          errors: strategyMicroServiceResponse.errors,
        },
        strategyMicroServiceResponse.status,
      );
    }

    return {
      message: strategyMicroServiceResponse.message,
      data: {
        strategies: strategyMicroServiceResponse.strategies,
      },
      errors: null,
    };
  }

  @Get()
  async getStrategyByid(@Query('id') id: string) {
    const strategyMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send({ cmd: 'strategy_get_by_id' }, { id }),
    );
    if (strategyMicroServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: strategyMicroServiceResponse.message,
          data: null,
          errors: strategyMicroServiceResponse.errors,
        },
        strategyMicroServiceResponse.status,
      );
    }
    return {
      message: strategyMicroServiceResponse.message,
      data: {
        strategy: strategyMicroServiceResponse.strategies,
      },
      errors: null,
    };
  }

  @Patch()
  async deactivateStrategy(@Query('id') strategyId: string) {
    const strategyMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send(
        { cmd: 'strategy_deactivate' },
        { strategyId },
      ),
    );
    if (strategyMicroServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: strategyMicroServiceResponse.message,
          data: null,
          errors: strategyMicroServiceResponse.errors,
        },
        strategyMicroServiceResponse.status,
      );
    }

    return {
      message: strategyMicroServiceResponse.message,
      data: {
        strategy: strategyMicroServiceResponse.strategies,
      },
      errors: null,
    };
  }
}
