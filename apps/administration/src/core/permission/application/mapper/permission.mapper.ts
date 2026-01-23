
/* ============================================
   administration/src/core/permission/application/mapper/permission.mapper.ts
   ============================================ */

import { Permission } from '../../domain/entity/permission-domain-entity';
import { RegisterPermissionDto, UpdatePermissionDto } from '../dto/in';
import {
  PermissionResponseDto,
  PermissionListResponse,
  PermissionDeletedResponseDto,
} from '../dto/out';
import { PermissionOrmEntity } from '../../infrastructure/entity/permission-orm.entity';

export class PermissionMapper {
  static toResponseDto(permission: Permission): PermissionResponseDto {
    return {
      id_permiso: permission.id_permiso!,
      nombre: permission.nombre,
      descripcion: permission.descripcion,
      activo: permission.activo!,
    };
  }

  static toListResponse(permissions: Permission[]): PermissionListResponse {
    return {
      permissions: permissions.map((permission) => this.toResponseDto(permission)),
      total: permissions.length,
    };
  }

  static fromRegisterDto(dto: RegisterPermissionDto): Permission {
    return Permission.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      activo: true,
    });
  }

  static fromUpdateDto(permission: Permission, dto: UpdatePermissionDto): Permission {
    return Permission.create({
      id_permiso: permission.id_permiso,
      nombre: dto.nombre ?? permission.nombre,
      descripcion: dto.descripcion ?? permission.descripcion,
      activo: permission.activo,
    });
  }

  static withStatus(permission: Permission, activo: boolean): Permission {
    return Permission.create({
      id_permiso: permission.id_permiso,
      nombre: permission.nombre,
      descripcion: permission.descripcion,
      activo: activo,
    });
  }

  static toDeletedResponse(id_permiso: number): PermissionDeletedResponseDto {
    return {
      id_permiso,
      message: 'Permiso eliminado exitosamente',
      deletedAt: new Date(),
    };
  }

  static toDomainEntity(permissionOrm: PermissionOrmEntity): Permission {
    return Permission.create({
      id_permiso: permissionOrm.id_permiso,
      nombre: permissionOrm.nombre,
      descripcion: permissionOrm.descripcion,
      activo: Boolean(permissionOrm.activo),
    });
  }

  static toOrmEntity(permission: Permission): PermissionOrmEntity {
    const permissionOrm = new PermissionOrmEntity();
    if (permission.id_permiso) {
      permissionOrm.id_permiso = permission.id_permiso;
    }
    permissionOrm.nombre = permission.nombre;
    permissionOrm.descripcion = permission.descripcion ?? '';
    permissionOrm.activo = permission.activo ?? true;
    return permissionOrm;
  }
}