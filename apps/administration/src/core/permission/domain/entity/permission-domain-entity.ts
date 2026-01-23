/* ============================================
   administration/src/core/permission/domain/entity/permission-domain-entity.ts
   ============================================ */

export interface PermissionProps {
  id_permiso?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export class Permission {
  private constructor(private readonly props: PermissionProps) {}

  static create(props: PermissionProps): Permission {
    return new Permission({
      ...props,
      activo: props.activo ?? true,
    });
  }

  get id_permiso() {
    return this.props.id_permiso;
  }

  get nombre() {
    return this.props.nombre;
  }

  get descripcion() {
    return this.props.descripcion;
  }

  get activo() {
    return this.props.activo;
  }

  isActive(): boolean {
    return this.props.activo === true;
  }
}
