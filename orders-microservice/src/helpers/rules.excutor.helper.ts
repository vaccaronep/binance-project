import { IOrder } from 'src/schema/order.schema';
import { OrdersService } from 'src/services/orders.service';

type Dependencies = {
  orderClient?: OrdersService;
  pythonClient?: any;
};

export interface IRuleExecutor {
  execute: (config: any, dependencies: Dependencies) => void;
}

class SellStopLossOco implements IRuleExecutor {
  constructor(
    private order: IOrder,
    private rule: any,
  ) {}
  execute = (config: any, dependencies: Dependencies) => {
    //restar en pythonanywhere.
    //primero un get y luego un update.
  };
}

class SellLimitMakerOco implements IRuleExecutor {
  constructor(
    private order: IOrder,
    private rule: any,
  ) {}
  execute = (config: any, dependencies: Dependencies) => {
    //restar en pythonanywhere.
    //primero un get y luego un update.
  };
}

class BuyMarketOco implements IRuleExecutor {
  constructor(
    private order: IOrder,
    private rule: any,
  ) {}
  execute = (config: any, dependencies: Dependencies) => {
    dependencies.orderClient.placeStopLossAndTakeProfit(
      config,
      this.rule,
      this.order,
    );
    //sumar uno en la base de datos de actual_trade
  };
}

export const getRuleExecutorFlow = (
  order: IOrder,
  rule: any,
): IRuleExecutor => {
  if (
    order.side !== rule.side &&
    rule.type === 'OCO' &&
    order.orderType === 'LIMIT_MAKER'
  ) {
    return new SellLimitMakerOco(order, rule);
  }

  if (
    order.side !== rule.side &&
    rule.type === 'OCO' &&
    order.orderType === 'STOP_LOSS_LIMIT'
  ) {
    return new SellStopLossOco(order, rule);
  }

  if (
    order.side === rule.side &&
    order.orderType === 'MARKET' &&
    rule.type === 'OCO'
  ) {
    return new BuyMarketOco(order, rule);
  }
};
