import { Controller, HttpStatus } from '@nestjs/common';
import { StrategiesService } from './services/strategies.service';
import { MessagePattern } from '@nestjs/microservices';
import { IStrategy } from './interfaces/strategy.interface';
import {
  IStrategyCreateResponse,
  IStrategyGetResponse,
} from './interfaces/strategy-create-response.interface';

@Controller('strategies')
export class StrategiesController {
  constructor(private readonly strategyService: StrategiesService) {}

  @MessagePattern({ cmd: 'strategy_create' })
  public async createStrategy(
    strategyParams: IStrategy,
  ): Promise<IStrategyCreateResponse> {
    let result: IStrategyCreateResponse;
    try {
      strategyParams.is_active = true;
      const createdStrategy =
        await this.strategyService.createStrategy(strategyParams);
      result = {
        status: HttpStatus.CREATED,
        message: 'strategy_create_success',
        strategy: createdStrategy,
        errors: null,
      };
    } catch (error) {
      result = {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'strategy_create_failed',
        strategy: null,
        errors: error.errors,
      };
    }
    return result;
  }

  @MessagePattern({ cmd: 'strategy_get_all' })
  public async getAllStrategies(params: {
    name: string;
  }): Promise<IStrategyGetResponse> {
    let result: IStrategyGetResponse;

    try {
      const strategies = await this.strategyService.getAllStrategies(params);
      result = {
        status: HttpStatus.OK,
        errors: null,
        strategies,
        message: 'strategy_get_all_success',
      };
    } catch (error) {
      result = {
        status: HttpStatus.OK,
        errors: error.errors,
        strategies: null,
        message: 'strategy_get_all_failed',
      };
    }
    return result;
  }

  @MessagePattern({ cmd: 'strategy_deactivate' })
  public async deactivateStrategy(data: {
    strategyId: string;
  }): Promise<IStrategyGetResponse> {
    let result: IStrategyGetResponse;
    if (data && data.strategyId) {
      try {
        const strategy = await this.strategyService.deactivateStrategy(
          data.strategyId,
        );
        if (strategy) {
          result = {
            status: HttpStatus.OK,
            message: 'strategy_deactivate_success',
            strategies: strategy,
            errors: null,
          };
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'strategy_deactivate_not_found',
            strategies: null,
            errors: null,
          };
        }
      } catch (error) {
        result = {
          strategies: null,
          message: 'strategy_deactivate_internal_error',
          errors: error.errors,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'strategy_deactivate_bad_request',
        strategies: null,
        errors: null,
      };
    }
    return result;
  }

  @MessagePattern({ cmd: 'strategy_get_by_id' })
  public async getStrategyById(
    strategyId: string,
  ): Promise<IStrategyGetResponse> {
    let result: IStrategyGetResponse;

    if (strategyId) {
      try {
        const strategy = await this.strategyService.getStrategyById(strategyId);
        if (strategy) {
          result = {
            status: HttpStatus.OK,
            message: 'strategy_get_by_id_success',
            strategies: strategy,
            errors: null,
          };
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'strategy_get_by_id_not_found',
            strategies: null,
            errors: null,
          };
        }
      } catch (error) {
        result = {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: error.errors,
          strategies: null,
          message: 'strategy_get_by_id_failed',
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'strategy_get_by_id_bad_request',
        strategies: null,
        errors: null,
      };
    }

    return result;
  }
}
