import {
  OnGatewayConnection,
  // OnGatewayDisconnect,
  // OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MyGateway implements OnGatewayConnection {
  private readonly connectedClients: Map<string, Socket> = new Map();

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const configId = client.handshake.query.configId.toString();
    if (configId) {
      if (!this.connectedClients.has(configId)) {
        this.connectedClients.set(configId, client);
        client.on('disconnect', () => {
          this.connectedClients.delete(configId);
        });
      }
    } else {
      client.disconnect();
    }
  }

  newMessage(message: string, configId: string) {
    const socket = this.connectedClients.get(configId);
    if (socket) socket.emit('order_update', message);
    // this.server.emit('order_update', message);
  }

  updateAccount(message: string) {
    this.server.emit('account_update', message);
  }
}
