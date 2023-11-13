import { IRule } from './rule.interface';

export interface IRuleCreateResponse {
  status: number;
  message: string;
  rule: IRule | null;
  errors: { [key: string]: any } | null;
}

export interface IRuleGetResponse {
  status: number;
  message: string;
  rules: IRule | null | IRule[];
  errors: { [key: string]: any } | null;
}
