import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RedisService {
  constructor(@Inject('API_GATEWAY_SUBSCRIBER') private client: ClientProxy) {}
  async publish(topic: string, data: { message: string; configId: string }) {
    this.client.emit(topic, data);
  }
}
