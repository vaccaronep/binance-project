import { Controller, HttpStatus } from '@nestjs/common';
import { RulesService } from './services/rules.service';
import { IGetAllRulesParams, IRule } from './interfaces/rule.interface';
import { MessagePattern } from '@nestjs/microservices';
import {
  IRuleCreateResponse,
  IRuleGetResponse,
} from './interfaces/rule-create-response.interface';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @MessagePattern({ cmd: 'rule_create' })
  async createRule(params: {
    rule: IRule;
    userId: string;
  }): Promise<IRuleCreateResponse> {
    let result: IRuleCreateResponse;
    const rule = params.rule;
    if (
      !rule.ticker ||
      !rule.userId ||
      !rule.pyramiding ||
      !rule.quantity_trade ||
      !rule.side
    ) {
      result = {
        status: HttpStatus.CONFLICT,
        message: 'rule_create_conflict',
        rule: null,
        errors: {
          meesage: {
            message: 'missing parameter',
          },
        },
      };
    }
    try {
      rule.userId = params.userId;
      rule.created_by = params.userId;
      const createdRule = await this.rulesService.createRule(rule);
      result = {
        status: HttpStatus.CREATED,
        message: 'rule_create_success',
        rule: createdRule,
        errors: null,
      };
    } catch (error) {
      console.log(error);
      result = {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'rule_create_precondition_failed',
        rule: null,
        errors: error.errors,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'rules_get_all' })
  async getAll(data: IGetAllRulesParams): Promise<IRuleGetResponse> {
    let result: IRuleGetResponse;
    if (data) {
      try {
        const rules = await this.rulesService.getAllRules(
          data.userId,
          data.ruleId,
          data.ticker,
          data.is_active,
          data.is_future,
          data.strategyId,
          data.side,
        );
        result = {
          rules,
          errors: null,
          message: 'rules_get_all_success',
          status: HttpStatus.OK,
        };
      } catch (error) {
        result = {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'rules_get_all_internal_error',
          rules: null,
          errors: error.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'rules_get_all_bad_request',
        rules: null,
        errors: null,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'rule_get_by_id' })
  async getById(data: { id: string }): Promise<IRuleGetResponse> {
    let result: IRuleGetResponse;
    if (!data || (data && !data.id)) {
      result = {
        errors: null,
        message: 'rule_get_by_id_bad_request',
        rules: null,
        status: HttpStatus.BAD_REQUEST,
      };
    } else {
      try {
        const rule = await this.rulesService.getRuleById(data.id);
        result = {
          rules: rule,
          message: 'rule_get_by_id_success',
          errors: null,
          status: HttpStatus.OK,
        };
      } catch (error) {
        result = {
          rules: null,
          message: 'rule_get_by_id_internal_error',
          errors: error.errors,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }
    }

    return result;
  }

  @MessagePattern({ cmd: 'rule_deactivate' })
  async patchRule(data: { ruleId: string }): Promise<IRuleGetResponse> {
    let result: IRuleGetResponse;
    if (data && data.ruleId) {
      try {
        const rule = await this.rulesService.deactivateRule(data.ruleId);
        result = {
          rules: rule,
          message: 'rule_deactivate_success',
          errors: null,
          status: HttpStatus.OK,
        };
      } catch (error) {
        result = {
          rules: null,
          message: 'rule_deactivate_internal_error',
          errors: error.errors,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }
    } else {
      result = {
        rules: null,
        message: 'rule_deactivate_bad_request',
        errors: null,
        status: HttpStatus.BAD_REQUEST,
      };
    }
    return result;
  }
}
