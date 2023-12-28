import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IConfig } from 'src/interfaces/config.interface';
import { Model } from 'mongoose';
import { BinanceWsWrapper } from 'src/binance/binance.ws';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DbService {
  constructor(
    @InjectModel('Config') private readonly configModel: Model<IConfig>,
    @Inject(forwardRef(() => BinanceWsWrapper))
    private readonly wsService: BinanceWsWrapper,
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
    @Inject('MARKET_SERVICE') private readonly marketClient: ClientProxy,
  ) {}

  async disableAccount(config: IConfig): Promise<IConfig> {
    const accountUpdated = await this.configModel
      .findByIdAndUpdate(
        config._id,
        {
          is_active: !config.is_active,
        },
        { new: true },
      )
      .select('-api_key -api_secret')
      .exec();
    return accountUpdated;
  }

  async updateAccount(id: string, config: IConfig): Promise<IConfig> {
    const accountUpdated = await this.configModel
      .findByIdAndUpdate(
        id,
        {
          name: config.name,
          is_papper_trading: config.is_papper_trading,
          is_futures: config.is_futures,
          api_key: config.api_key,
          api_secret: config.api_secret,
          api_url: config.api_url,
          ws_url: config.ws_url,
        },
        { new: true },
      )
      .exec();

    if (accountUpdated.account_activated) {
      this.wsService.reconnectWs(accountUpdated);
    }

    if (accountUpdated.orders_activated) {
      this.ordersClient.emit(
        { cmd: 'order_reconnect_ws_user' },
        { configId: accountUpdated._id },
      );
    }

    return accountUpdated;
  }

  async setAccountKeys(userId: string, config: IConfig) {
    config.userId = userId;
    const configModel = new this.configModel(config);
    return configModel.save();
  }

  async getAccountKeys(): Promise<IConfig[]> {
    return this.configModel.find({ is_active: true }).exec();
  }

  async searchConfigById(configId: string) {
    return this.configModel.findById(configId);
  }

  async getAccountKeysByUser(data: {
    userId: string;
    is_active?: boolean;
    is_futures?: boolean;
    is_papper_trading?: boolean;
    account_activated?: boolean;
    orders_activated?: boolean;
    market_activated?: boolean;
  }): Promise<IConfig[]> {
    let conditions = {};
    conditions = { userId: data.userId };
    if (data.is_active) {
      conditions = { ...conditions, is_active: data.is_active };
    }
    if (data.is_futures) {
      conditions = { ...conditions, is_futures: data.is_futures };
    }
    if (data.is_papper_trading) {
      conditions = { ...conditions, is_papper_trading: data.is_papper_trading };
    }
    if (data.account_activated) {
      conditions = { ...conditions, account_activated: data.account_activated };
    }
    if (data.orders_activated) {
      conditions = { ...conditions, orders_activated: data.orders_activated };
    }
    if (data.market_activated) {
      conditions = { ...conditions, market_activated: data.market_activated };
    }
    return this.configModel.find(conditions).exec();
  }

  public async enableAccount(config: IConfig): Promise<IConfig> {
    try {
      const userUpdated = await this.configModel
        .findByIdAndUpdate(
          config._id,
          {
            account_activated: !config.account_activated,
          },
          { new: true },
        )
        .select('-api_key -api_secret')
        .exec();

      if (userUpdated.account_activated) {
        this.wsService.connectNewWs(config._id);
      } else {
        this.wsService.removeNewWs(config._id);
      }

      return userUpdated;
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  public async enableOrder(config: IConfig): Promise<IConfig> {
    try {
      const userModel = await this.configModel
        .findByIdAndUpdate(
          config._id,
          {
            orders_activated: !config.orders_activated,
          },
          { new: true },
        )
        .select('-api_key -api_secret')
        .exec();

      if (userModel.orders_activated) {
        this.ordersClient.emit(
          { cmd: 'order_add_ws_user' },
          { configId: config._id },
        );
      } else {
        this.ordersClient.emit(
          { cmd: 'order_remove_ws_user' },
          { configId: config._id },
        );
      }

      return userModel;
    } catch (error) {
      return null;
    }
  }

  public async enableMarket(config: IConfig): Promise<IConfig> {
    try {
      const userModel = await this.configModel
        .findByIdAndUpdate(
          config._id,
          {
            market_activated: !config.market_activated,
          },
          { new: true },
        )
        .select('-api_key -api_secret')
        .exec();

      if (userModel.market_activated) {
        console.log('activating market');
        this.marketClient.emit(
          { cmd: 'market_add_ws_user' },
          { configId: config._id },
        );
      } else {
        console.log('removing market');
        this.marketClient.emit(
          { cmd: 'market_remove_ws_user' },
          { configId: config._id },
        );
      }

      return userModel;
    } catch (error) {
      return null;
    }
  }
}
