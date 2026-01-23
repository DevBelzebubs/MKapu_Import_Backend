
/* ============================================
   administration/src/core/permission/infrastructure/adapters/out/permission-websocket.gateway.ts
   ============================================ */

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { IPermissionQueryPort } from '../../../domain/ports/in/permission-ports-in';
import { PermissionResponseDto } from '../../../application/dto/out/permission-reponse-dto';

@WebSocketGateway({
  namespace: '/permissions',
  cors: {
    origin: '*',
  },
})
export class PermissionWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('IPermissionQueryPort')
    private readonly permissionQueryService: IPermissionQueryPort,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado al canal Permissions: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  notifyPermissionCreated(permission: PermissionResponseDto): void {
    this.server.emit('permissionCreated', permission);
  }

  notifyPermissionUpdated(permission: PermissionResponseDto): void {
    this.server.emit('permissionUpdated', permission);
  }

  notifyPermissionDeleted(permissionId: number): void {
    this.server.emit('permissionDeleted', { id_permiso: permissionId });
  }

  notifyPermissionStatusChanged(permission: PermissionResponseDto): void {
    this.server.emit('permissionStatusChanged', permission);
  }
}