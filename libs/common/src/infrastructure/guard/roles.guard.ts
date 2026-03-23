/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExecutionContext,
  Injectable,
  CanActivate,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorators';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private readonly rolePermissions = {
    VENDEDOR: [
      'VER_DASHBOARD_VENTAS',
      'CREAR_VENTA',
      'VER_VENTAS',
      'CREAR_COTIZACIONES',
      'CREAR_CLIENTE',
      'CREAR_RECLAMO',
      'AGREGAR_DOCUMENTO',
    ],
    CAJERO: [
      'VER_CAJA',
      'CREAR_VENTA',
      'VER_VENTAS',
      'CREAR_VENTA_POR_COBRAR',
      'CREAR_COTIZACIONES',
      'CREAR_CLIENTE',
    ],
    ALMACENERO: [
      'VER_DASHBOARD_ALMACEN',
      'VER_MOVIMIENTOS',
      'CONTEO_INVENTARIO',
      'CREAR_MOV_INVENTARIO',
      'CREAR_TRANSFERENCIA',
      'CREAR_DESPACHO',
      'CREAR_REMISION',
    ],
    'JEFE DE ALMACEN': [
      'VER_DASHBOARD_ALMACEN',
      'VER_MOVIMIENTOS',
      'CONTEO_INVENTARIO',
      'CREAR_MOV_INVENTARIO',
      'CREAR_TRANSFERENCIA',
      'CREAR_DESPACHO',
      'CREAR_REMISION',
      'CREAR_AJUSTE_INVENTARIO',
      'CREAR_ALMACEN',
      'CREAR_MERMAS',
      'CREAR_REMATES',
    ],
    ADMINISTRADOR: ['*'],
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException(
        'El usuario no tiene roles asignados o no está autenticado',
      );
    }

    const hasRole = () => {
      return user.roles.some((userRole: string) => {
        if (requiredRoles.includes(userRole)) return true;

        const permissions = this.rolePermissions[userRole] || [];

        if (permissions.includes('*')) return true;

        return requiredRoles.some((reqRole) => permissions.includes(reqRole));
      });
    };

    if (!hasRole()) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de estos roles/permisos: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
