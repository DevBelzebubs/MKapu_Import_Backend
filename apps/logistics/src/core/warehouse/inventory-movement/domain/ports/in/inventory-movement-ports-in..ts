import { RegisterMovementDto } from '../../../application/dto/in/register-income.dto';

export interface InventoryMovementPortsIn {
  registerIncome(dto: RegisterMovementDto): Promise<void>;
  registerExit(dto: RegisterMovementDto): Promise<void>;
}
