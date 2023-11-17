import { IOrder } from 'src/schema/order.schema';

export interface IOrdersGetResponse {
  status: number;
  message: string;
  orders: IOrder[] | null | IOrder;
  errors: { [key: string]: any } | null;
}
