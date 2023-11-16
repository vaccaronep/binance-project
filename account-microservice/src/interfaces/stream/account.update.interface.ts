export interface AccountUpdate {
  e: string; // event type
  E: number; // event time
  u: number; // time of the last account update
  B: Balance[]; // balances array
}

interface Balance {
  a: string; // asset
  f: string; // free
  l: string; // locked
}
