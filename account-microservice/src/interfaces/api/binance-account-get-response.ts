interface Balance {
  ticker: string;
  balance: string;
}

interface Commissions {
  maker: string;
  taker: string;
  buyer: string;
  seller: string;
}

export interface BinanceAccount {
  balances: Balance[];
  accountType: string;
  commissionRates: Commissions;
}

export interface IBinanceAccountGetResponse {
  status: number;
  message: string;
  account: BinanceAccount | null;
  errors: { [key: string]: any } | null;
}
