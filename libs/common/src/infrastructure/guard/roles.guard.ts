/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExecutionContext,
  Injectable,
  CanActivate,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorators';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private readonly rolePermissions = {
    VENDEDOR: [
      'REGISTRAR_VENTA',
      'GENERAR_COTIZACION',
      'BUSCAR_PRODUCTOS',
      'REGISTRAR_RECLAMO',
      'REGISTRAR_GARANTIA',
    ],
    CAJERO: [
      'ABRIR_CAJA',
      'CERRAR_CAJA',
      'GESTIONAR_CAJA_CHICA',
      'GENERAR_COTIZACION',
      'BUSCAR_PRODUCTOS',
    ],
    ALMACENERO: [
      'VER_STOCK',
      'REGISTRAR_ENTRADA',
      'REGISTRAR_SALIDA',
      'VER_MOVIMIENTOS',
      'CLASIFICAR_PRODUCTO',
    ],
    'JEFE DE ALMACEN': [
      'VER_STOCK',
      'REGISTRAR_ENTRADA',
      'REGISTRAR_SALIDA',
      'APROBAR_GARANTIA',
      'VER_MOVIMIENTOS',
    ],
    ADMINISTRADOR: ['*'],
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const userRoleHeader = request.headers['x-role'];

    const user = request.user;

    if (!userRoleHeader) {
      throw new UnauthorizedException('Faltan credenciales de rol (x-role)');
    }

    const hasRole = requiredRoles.includes(userRoleHeader);

    if (
      user &&
      user.role !== userRoleHeader &&
      userRoleHeader !== 'ADMINISTRADOR'
    ) {
      throw new ForbiddenException(
        'El rol del header no coincide con el token',
      );
    }

    if (!hasRole) {
      throw new ForbiddenException(
        `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
