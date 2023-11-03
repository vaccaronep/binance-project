import { Injectable } from '@nestjs/common';
import {
  InjectWebSocketProvider,
  WebSocketClient,
  EventListener,
} from 'nestjs-websocket';
import { ClientRequest, IncomingMessage } from 'http';

@Injectable()
export class WebsocketBinanceService {
  constructor(
    @InjectWebSocketProvider() private readonly ws: WebSocketClient,
  ) {}
  @EventListener('open')
  open() {
    console.log('The connection is established.');
  }

  @EventListener('ping')
  ping(data: Buffer) {
    console.log(`A ping ${data.toString()} is received from the server.`);
    this.ws.pong();
  }

  @EventListener('pong')
  pong(data: Buffer) {
    console.log(`A pong ${data.toString()}.`);
  }

  @EventListener('unexpected-response')
  unexpectedResponse(request: ClientRequest, response: IncomingMessage) {
    console.log(`The server response ${response} is not the expected one.`);
  }

  @EventListener('upgrade')
  upgrade(response: IncomingMessage) {
    console.log(
      `Response headers ${response} are received from the server as part of the handshake.`,
    );
  }

  @EventListener('message')
  message(data: WebSocketClient.Data) {}

  @EventListener('error')
  error(err: Error) {
    console.log(`An error occurs: ${err}`);
  }

  @EventListener('close')
  close(code: number, reason: string) {
    console.log(`The connection is closed. Reason: ${code} - ${reason}`);
  }
}
