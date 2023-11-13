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
import { CreateRuleDto } from 'src/interfaces/rules/create.rule.dto';
import { Authorization } from './decorators/auth.decorator';

@Controller('rules')
@ApiTags('rules')
export class RulesController {
  constructor(
    @Inject('RULES_SERVICE') private readonly rulesMicroService: ClientProxy,
  ) {}

  @Post()
  @Authorization(true)
  async createrule(@Body() ruleRquest: CreateRuleDto) {
    const rulesMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send({ cmd: 'rule_create' }, ruleRquest),
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
  async getallrules(
    @Query('userId') userId?: string,
    @Query('ruleId') ruleId?: string,
    @Query('ticker') ticker?: string,
  ) {
    const rulesMicroServiceResponse: any = await firstValueFrom(
      this.rulesMicroService.send(
        { cmd: 'rules_get_all' },
        { userId, ruleId, ticker },
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
