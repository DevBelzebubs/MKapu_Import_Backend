import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  IRolePermissionCommandPort,
  IRolePermissionQueryPort,
} from '../../../../domain/ports/in/role-permission-ports-in';
import {
  AssignPermissionsDto,
  RemovePermissionFromRoleDto,
  SyncPermissionsDto,
} from '../../../../application/dto/in';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('role-permissions')
export class RolePermissionRestController {
  constructor(
    @Inject('IRolePermissionCommandPort')
    private readonly cmd: IRolePermissionCommandPort,
    @Inject('IRolePermissionQueryPort')
    private readonly qry: IRolePermissionQueryPort,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('ADMINISTRADOR', 'ADMINISTRACION')
  getAllRolesWithPermissions() {
    return this.qry.getAllRolesWithPermissions();
  }

  @Get('role/:roleId')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMINISTRADOR', 'ADMINISTRACION')
  getPermissionsByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.qry.getPermissionsByRole(roleId);
  }

  @Get('permission/:permId')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMINISTRADOR', 'ADMINISTRACION')
  getRolesByPermission(@Param('permId', ParseIntPipe) permId: number) {
    return this.qry.getRolesByPermission(permId);
  }

  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMINISTRADOR', 'ADMINISTRACION')
  assignPermissions(@Body() dto: AssignPermissionsDto) {
    return this.cmd.assignPermissions(dto);
  }

  @Patch('sync')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMINISTRADOR', 'ADMINISTRACION')
  syncPermissions(@Body() dto: SyncPermissionsDto) {
    return this.cmd.syncPermissions(dto.roleId, dto.permissionIds);
  }

  @Delete('remove')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMINISTRADOR', 'ADMINISTRACION')
  removePermission(@Body() dto: RemovePermissionFromRoleDto) {
    return this.cmd.removePermissionFromRole(dto);
  }
}
