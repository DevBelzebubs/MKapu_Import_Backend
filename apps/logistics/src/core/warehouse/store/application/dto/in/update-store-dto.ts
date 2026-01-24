
// logistics/src/core/warehouse/store/application/dto/in/update-store-dto.ts
export interface UpdateStoreDto {
  id_almacen: number;
  codigo?: string;
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
}