import { IConfig } from '../config.interface';

export interface IConfigsGetResponse {
  status: number;
  message: string;
  configs: IConfig[] | null;
  errors: { [key: string]: any } | null;
}
