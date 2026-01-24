
// logistics/src/core/warehouse/store/application/dto/out/store-response-dto.ts
export interface StoreResponseDto {
  id_almacen: number;
  codigo: string;
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  activo: boolean;
}