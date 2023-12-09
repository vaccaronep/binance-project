import { Controller, HttpStatus } from '@nestjs/common';
import { AccountService } from './services/account.service';
import { MessagePattern } from '@nestjs/microservices';
import { IConfig } from './interfaces/config.interface';
import { DbService } from './services/db.service';
import { IConfigsGetResponse } from './interfaces/api/config-get-response';
import {
  BinanceAccount,
  IBinanceAccountGetResponse,
} from './interfaces/api/binance-account-get-response';

@Controller()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly dbService: DbService,
  ) {}

  @MessagePattern({ cmd: 'account_get' })
  async getAccount(data: {
    userId: string;
    configId: string;
  }): Promise<IBinanceAccountGetResponse> {
    let result: IBinanceAccountGetResponse;
    if (data.userId || data.configId) {
      const config = await this.dbService.searchConfigById(data.configId);
      if (config) {
        const accountResponse: any = await this.accountService.getAccount(
          config.api_url,
          config.api_key,
          config.api_secret,
        );

        const { balances, commissionRates, accountType } = accountResponse;

        const account: BinanceAccount = {
          accountType,
          balances,
          commissionRates,
        };

        result = {
          status: HttpStatus.OK,
          message: 'account_get_success',
          account,
          errors: null,
        };
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'account_get_config_not_found',
          account: null,
          errors: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'account_get_missing_parameters',
        account: null,
        errors: null,
      };
    }
    return result;
  }

  @MessagePattern({ cmd: 'account_get_trades' })
  async getAccountTrades(data: { userId: string; tickerId: string }) {
    return this.accountService.getAccountTrades(data.tickerId);
  }

  @MessagePattern({ cmd: 'account_update' })
  async updateAccount(data: {
    configId: string;
    config: IConfig;
  }): Promise<IConfigsGetResponse> {
    let result: IConfigsGetResponse;

    if (data && data.config) {
      const config = await this.dbService.searchConfigById(data.configId);
      if (config) {
        const updatedConfig = await this.dbService.updateAccount(
          data.configId,
          data.config,
        );
        result = {
          status: HttpStatus.OK,
          message: 'account_update_success',
          configs: [updatedConfig],
          errors: null,
        };
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'account_update_not_found',
          configs: null,
          errors: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'account_update_missing_parameter',
        configs: null,
        errors: null,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'account_disable' })
  async disableAccount(data: {
    configId: string;
    userId: string;
  }): Promise<IConfigsGetResponse> {
    let result: IConfigsGetResponse;

    if (data.configId || data.userId) {
      if (data.configId) {
        const config = await this.dbService.searchConfigById(data.configId);
        if (!config) {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'account_disable_config_not_found',
            configs: null,
            errors: null,
          };
        } else {
          if (config.account_activated || config.orders_activated) {
            result = {
              status: HttpStatus.PRECONDITION_FAILED,
              message: 'account_disable_config_not_allowed',
              configs: null,
              errors: null,
            };
          } else {
            const configUpdated = await this.dbService.disableAccount(config);
            result = {
              status: HttpStatus.ACCEPTED,
              message: 'account_disable_config_success',
              configs: [configUpdated],
              errors: null,
            };
          }
        }
      } else {
        const configs = await this.dbService.getAccountKeysByUser({
          userId: data.userId,
        });
        if (configs) {
          const updatedConfigs = await Promise.all(
            configs.map(async (config) => {
              return this.dbService.disableAccount(config);
            }),
          );
          result = {
            status: HttpStatus.ACCEPTED,
            message: 'account_disable_config_success',
            configs: updatedConfigs,
            errors: null,
          };
        } else {
          result = {
            status: HttpStatus.NOT_FOUND,
            message: 'account_disable_config_not_found',
            configs: null,
            errors: null,
          };
        }
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'account_disable_missing_parameter',
        configs: null,
        errors: null,
      };
    }

    return result;
  }

  @MessagePattern({ cmd: 'account_set_keys' })
  async setAccountKeys(data: {
    userId: string;
    config: IConfig;
  }): Promise<IConfigsGetResponse> {
    let result: IConfigsGetResponse;
    if (data.userId && data.config) {
      const userConfigs = await this.dbService.getAccountKeysByUser({
        userId: data.userId,
      });

      const isNotValidToCreate = userConfigs.filter(
        (userConfig) =>
          userConfig.api_key === data.config.api_key &&
          userConfig.api_secret === data.config.api_secret &&
          userConfig.is_papper_trading === data.config.is_papper_trading &&
          userConfig.is_futures === data.config.is_futures,
      );

      if (!isNotValidToCreate.length) {
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
          status: HttpStatus.AMBIGUOUS,
          message: 'account_set_keys_duplicated',
          configs: [isNotValidToCreate[0]],
          errors: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'account_set_keys_missing_parameter',
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
