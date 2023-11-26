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
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateRuleDto } from 'src/interfaces/rules/create.rule.dto';
import { Authorization } from './decorators/auth.decorator';
import { IAuthorizedRequest } from './interfaces/common/authorized-request.interface';
import { Permission } from './decorators/permission.decorator';

@Controller('rules')
@ApiTags('rules')
export class RulesController {
  constructor(
    @Inject('RULES_SERVICE') private readonly rulesMicroService: ClientProxy,
  ) {}

  @Post()
  @Authorization(true)
  @Permission('rule_create')
  async createrule(
    @Req() request: IAuthorizedRequest,
    @Body() ruleRequest: CreateRuleDto,
  ) {
    const userId = request.user.id;
    const rulesMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send(
        { cmd: 'rule_create' },
        { rule: ruleRequest, userId },
      ),
    );

    if (rulesMicroServiceResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: rulesMicroServiceResponse.message,
          data: null,
          errors: rulesMicroServiceResponse.errors,
        },
        rulesMicroServiceResponse.status,
      );
    }
    return {
      message: rulesMicroServiceResponse.message,
      data: {
        rules: rulesMicroServiceResponse.rule,
      },
      errors: null,
    };
  }

  @Get('/all')
  @Authorization(true)
  @Permission('rules_get_all')
  async getallrules(
    @Req() request: IAuthorizedRequest,
    @Query('ruleId') ruleId?: string,
    @Query('ticker') ticker?: string,
    @Query('strategyId') strategyId?: string,
    @Query('is_future') is_future?: boolean,
    @Query('is_active') is_active?: boolean,
  ) {
    const userId = request.user.id;
    const rulesMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send(
        { cmd: 'rules_get_all' },
        { userId, ruleId, ticker, strategyId, is_future, is_active },
      ),
    );

    if (rulesMicroServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: rulesMicroServiceResponse.message,
          data: null,
          errors: rulesMicroServiceResponse.errors,
        },
        rulesMicroServiceResponse.status,
      );
    }

    return {
      message: rulesMicroServiceResponse.message,
      data: {
        rules: rulesMicroServiceResponse.rules,
      },
      errors: null,
    };
  }

  @Get()
  @Authorization(true)
  @Permission('rules_get_all')
  async getrulebyid(@Query('id') id: string) {
    const rulesMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send({ cmd: 'rule_get_by_id' }, { id }),
    );
    if (rulesMicroServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: rulesMicroServiceResponse.message,
          data: null,
          errors: rulesMicroServiceResponse.errors,
        },
        rulesMicroServiceResponse.status,
      );
    }
    return {
      message: rulesMicroServiceResponse.message,
      data: {
        rules: rulesMicroServiceResponse.rules,
      },
      errors: null,
    };
  }

  @Patch()
  @Authorization(true)
  @Permission('rule_deactivate')
  async patchRule(@Query('id') ruleId: string) {
    const rulesMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send({ cmd: 'rule_deactivate' }, { ruleId }),
    );
    if (rulesMicroServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: rulesMicroServiceResponse.message,
          data: null,
          errors: rulesMicroServiceResponse.errors,
        },
        rulesMicroServiceResponse.status,
      );
    }

    return {
      message: rulesMicroServiceResponse.message,
      data: {
        rules: rulesMicroServiceResponse.rules,
      },
      errors: null,
    };
  }
}
