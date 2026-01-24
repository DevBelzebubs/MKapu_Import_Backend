/* ============================================
   DOMAIN LAYER - STORE
   logistics/src/core/warehouse/store/domain/entity/store-domain-entity.ts
   ============================================ */

export interface StoreProps {
  id_almacen?: number;
  codigo: string;
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  activo?: boolean;
}

export class Store {
  private constructor(private readonly props: StoreProps) {}

  static create(props: StoreProps): Store {
    return new Store({
      ...props,
      activo: props.activo ?? true,
    });
  }

  get id_almacen() {
    return this.props.id_almacen;
  }

  get codigo() {
    return this.props.codigo;
  }

  get nombre() {
    return this.props.nombre;
  }

  get ciudad() {
    return this.props.ciudad;
  }

  get direccion() {
    return this.props.direccion;
  }

  get telefono() {
    return this.props.telefono;
  }

  get activo() {
    return this.props.activo;
  }

  // Métodos de negocio
  isActive(): boolean {
    return this.props.activo === true;
  }

  hasCompleteInfo(): boolean {
    return !!(
      this.props.nombre &&
      this.props.ciudad &&
      this.props.direccion &&
      this.props.telefono
    );
  }
}