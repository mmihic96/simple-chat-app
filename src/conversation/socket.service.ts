import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ transports: ['websocket'] })
export class SocketService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  protected server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    const queryParams = client.request.url.split('?')[1];

    const socketId = queryParams.split('&')[0].split('=')[1];

    socketId && client.join(socketId);

    console.log(
      `Client connected: ${socketId} to the room: ${socketId ?? client.id}`,
    );
  }

  handleDisconnect(client: Socket) {
    const queryParams = client.request.url.split('?')[1];

    const socketId = queryParams.split('&')[0].split('=')[1];

    socketId && client.leave(socketId);

    socketId && this.server.in(socketId).disconnectSockets();

    console.log(
      `Client disconnected: ${socketId} to the room: ${socketId ?? client.id}`,
    );
  }

  emit(name: string, data: any, socketId: string, exclude?: string) {
    exclude && this.server.except(exclude);
    console.log('emitting', name, data, socketId, exclude)
    this.server.to(socketId).emit(name, data);
  }

  joinRoom(socketId: string, room: string) {
    console.log('joining', socketId, room)
    this.server.in(socketId).socketsJoin(room);
  }
}
