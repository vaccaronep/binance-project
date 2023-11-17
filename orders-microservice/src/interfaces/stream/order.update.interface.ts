export interface OrderUpdate {
  e: string; //"executionReport",        // Event type
  E: number; //1499405658658,            // Event time
  s: string; //"ETHBTC",                 // Symbol
  c: string; //"mUvoqJxFIILMdfAW5iGSOW", // Client order ID
  S: string; //"BUY",                    // Side
  o: string; //"LIMIT",                  // Order type
  f: string; //"GTC",                    // Time in force
  q: string; //"1.00000000",             // Order quantity
  p: string; //"0.10264410",             // Order price
  P: string; //"0.00000000",             // Stop price
  F: string; //"0.00000000",             // Iceberg quantity
  g: number; //-1,                       // OrderListId
  C: string; //"",                       // Original client order ID; This is the ID of the order being canceled
  x: string; //"NEW",                    // Current execution type
  X: string; //"NEW",                    // Current order status
  r: string; //"NONE",                   // Order reject reason; will be an error code.
  i: string; //4293153,                  // Order ID
  l: string; //"0.00000000",             // Last executed quantity
  z: string; //"0.00000000",             // Cumulative filled quantity
  L: string; //"0.00000000",             // Last executed price
  n: string; //"0",                      // Commission amount
  N: string; //null,                     // Commission asset
  T: number; //1499405658657,            // Transaction time
  t: string; //-1,                       // Trade ID
  I: number; //8641984,                  // Ignore
  w: boolean; //true,                     // Is the order on the book?
  m: boolean; //false,                    // Is this trade the maker side?
  M: boolean; //false,                    // Ignore
  O: number; //1499405658657,            // Order creation time
  Z: string; //"0.00000000",             // Cumulative quote asset transacted quantity
  Y: string; //"0.00000000",             // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
  Q: string; //"0.00000000",             // Quote Order Quantity
  W: string; //1499405658657,            // Working Time; This is only visible if the order has been placed on the book.
  V: string; //"NONE"                    // selfTradePreventionMode
  j: number; //StrategyId
}
