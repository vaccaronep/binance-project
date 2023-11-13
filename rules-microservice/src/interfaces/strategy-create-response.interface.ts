import { IStrategy } from './strategy.interface';

export interface IStrategyCreateResponse {
  status: number;
  message: string;
  strategy: IStrategy | null;
  errors: { [key: string]: any } | null;
}

export interface IStrategyGetResponse {
  status: number;
  message: string;
  strategies: IStrategy[] | IStrategy | null;
  errors: { [key: string]: any } | null;
}
