import { CreateInventoryMovementDto } from '../../../application/dto/in/create-inventory-movement.dto';

export type MovementRequest = Omit<
  CreateInventoryMovementDto,
  'items' | 'originType'
> & {
  originType?: 'TRANSFERENCIA' | 'COMPRA' | 'VENTA' | 'AJUSTE';
  items: Omit<CreateInventoryMovementDto['items'][0], 'type'>[];
};

export interface IInventoryMovementCommandPort {
  executeMovement(dto: CreateInventoryMovementDto): Promise<void>;
  registerIncome(dto: MovementRequest): Promise<void>;
  registerExit(dto: MovementRequest): Promise<void>;
}
