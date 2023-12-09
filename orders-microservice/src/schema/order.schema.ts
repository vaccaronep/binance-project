import * as mongoose from 'mongoose';

export interface IOrder extends mongoose.Document {
  eventType: string; //"executionReport",        // Event type
  eventTime: number; //1499405658658,            // Event time
  symbol: string; //"ETHBTC",                 // Symbol
  clientOrderId: string; //"mUvoqJxFIILMdfAW5iGSOW", // Client order ID
  side: string; //"BUY",                    // Side
  orderType: string; //"LIMIT",                  // Order type
  orderQuantity: string; //"1.00000000",             // Order quantity
  orderPrice: string; //"0.10264410",             // Order price
  stopPrice: string; //"0.00000000",             // Stop price
  orderListId: number; //-1,                       // OrderListId
  originalClientOrderId: string; //"",                       // Original client order ID; This is the ID of the order being canceled
  currentExecutionType: string; //"NEW",                    // Current execution type
  currentOrderStatus: string; //"NEW",                    // Current order status
  orderId: string; //4293153,                  // Order ID
  lastExecutedQuantity: string; //"0.00000000",             // Last executed quantity
  cumulativeFilledQuantity: string; //"0.00000000",             // Cumulative filled quantity
  lastExecutedPrice: string; //"0.00000000",             // Last executed price
  commissionAmmount: string; //"0",                      // Commission amount
  commissionAsset: string; //null,                     // Commission asset
  transactionTime: number; //1499405658657,            // Transaction time
  tradeId: string; //-1,                       // Trade ID
  orderCreationTime: number; //1499405658657,            // Order creation time
  quoteOrderQuantity: string; //"0.00000000",             // Quote Order Quantity
  strategyId: number;
  configId: string;
}

export const OrderSchema = new mongoose.Schema<IOrder>({
  eventType: {
    type: String,
  },
  eventTime: { type: Number },
  symbol: { type: String },
  clientOrderId: { type: String },
  side: { type: String },
  orderType: { type: String },
  orderQuantity: { type: String },
  orderPrice: { type: String },
  stopPrice: { type: String },
  orderListId: { type: Number },
  originalClientOrderId: { type: String },
  currentExecutionType: { type: String },
  currentOrderStatus: { type: String },
  orderId: { type: String },
  lastExecutedQuantity: { type: String },
  cumulativeFilledQuantity: { type: String },
  lastExecutedPrice: { type: String },
  commissionAmmount: { type: String },
  commissionAsset: { type: String },
  transactionTime: { type: Number },
  tradeId: { type: String },
  orderCreationTime: { type: Number },
  quoteOrderQuantity: { type: String },
  strategyId: { type: Number },
  configId: { type: String },
});
