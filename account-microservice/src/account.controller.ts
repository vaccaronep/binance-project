import { Controller, HttpStatus } from '@nestjs/common';
import { AccountService } from './services/account.service';
import { MessagePattern } from '@nestjs/microservices';
import { IConfig } from './interfaces/config.interface';
import { DbService } from './services/db.service';
import { IConfigsGetResponse } from './interfaces/api/config-get-response';

@Controller()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly dbService: DbService,
  ) {}

  @MessagePattern({ cmd: 'account_get' })
  getAccount(data: { userId: string }) {
    console.log(data.userId);
    return this.accountService.getAccount();
  }

  @MessagePattern({ cmd: 'account_get_trades' })
  async getAccountTrades(data: { userId: string; tickerId: string }) {
    return this.accountService.getAccountTrades(data.tickerId);
  }

  @MessagePattern({ cmd: 'account_set_keys' })
  async setAccountKeys(data: {
    userId: string;
    config: IConfig;
  }): Promise<IConfigsGetResponse> {
    let result: IConfigsGetResponse;
    if (data.userId && data.config) {
      const config = await this.dbService.setAccountKeys(
        data.userId,
        data.config,
      );
      result = {
        status: HttpStatus.OK,
        message: 'account_set_keys_success',
        configs: [config],
        errors: null,
      };
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'account_get_keys_missing_parameter',
        configs: null,
        errors: null,
      };
    }
    return result;
  }

  @MessagePattern({ cmd: 'account_get_keys' })
  async getAccountKeys(data: {
    userId: string;
    account_activated?: boolean;
    orders_activated?: boolean;
  }): Promise<IConfigsGetResponse> {
    let result: IConfigsGetResponse;
    if (data.userId) {
      const configs = await this.dbService.getAccountKeysByUser({
        userId: data.userId,
        is_active: true,
        account_activated: data.account_activated,
        orders_activated: data.orders_activated,
      });
      if (configs) {
        result = {
          status: HttpStatus.OK,
          message: 'account_get_keys_success',
          configs: configs,
          errors: null,
        };
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'account_get_keys_config_not_found',
          configs: null,
          errors: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'account_get_keys_missing_parameter',
        configs: null,
        errors: null,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'account_get_keys_by_id' })
  async getAccountKeysById(data: {
    configId: string;
  }): Promise<IConfigsGetResponse> {
    let result: IConfigsGetResponse;
    if (data.configId) {
      const config = await this.dbService.searchConfigById(data.configId);
      if (config) {
        result = {
          status: HttpStatus.OK,
          message: 'config_get_by_id_success',
          configs: [config],
          errors: null,
        };
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'config_get_by_id_config_not_found',
          configs: null,
          errors: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'config_get_by_id_missing_parameter',
        configs: null,
        errors: null,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'config_enable_account' })
  public async enableAccountWsToUser(data: {
    userId: string;
    configId: string;
  }): Promise<IConfigsGetResponse> {
    let result: IConfigsGetResponse;
    if (data.configId) {
      try {
        const config = await this.dbService.searchConfigById(data.configId);
        if (!config) {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'config_enable_account_config_not_found',
            configs: null,
            errors: null,
          };
        }
        const updatedConfig = await this.dbService.enableAccount(config);
        result = {
          status: HttpStatus.OK,
          message: 'config_enable_account_success',
          configs: [updatedConfig],
          errors: null,
        };
      } catch (e) {
        console.log(e);
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'config_enable_account_precondition_failed',
          configs: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'config_enable_account',
        configs: null,
        errors: null,
      };
    }
    return result;
  }

  @MessagePattern({ cmd: 'config_enable_order' })
  public async enableOrderWsToUser(data: {
    configId: string;
    userId: string;
  }): Promise<IConfigsGetResponse> {
    let result: IConfigsGetResponse;
    if (data.configId) {
      try {
        const config = await this.dbService.searchConfigById(data.configId);
        if (!config) {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'config_enable_order_config_not_found',
            configs: null,
            errors: null,
          };
        }
        const updatedConfig = await this.dbService.enableOrder(config);
        result = {
          status: HttpStatus.OK,
          message: 'config_enable_order_success',
          configs: [updatedConfig],
          errors: null,
        };
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'config_enable_order_failed',
          configs: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'config_enable_order',
        configs: null,
        errors: null,
      };
    }
    return result;
  }
}
