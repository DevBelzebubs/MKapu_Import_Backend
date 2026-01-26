export class RegisterMovementItemDto {
  productId: number;
  warehouseId: number;
  quantity: number;
}

export class RegisterMovementDto {
  refId: number;
  refTable: string;
  observation?: string;
  items: RegisterMovementItemDto[];
}
