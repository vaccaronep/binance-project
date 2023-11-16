import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RedisService {
  constructor(@Inject('API_GATEWAY_SUBSCRIBER') private client: ClientProxy) {}
  async publish(topic: string, data: { message: any }) {
    this.client.emit(topic, data.message);
  }
}
