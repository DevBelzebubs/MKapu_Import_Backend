
/* ============================================
   logistics/src/core/warehouse/store/application/service/store-command.service.ts
   ============================================ */

import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IStoreCommandPort } from '../../domain/ports/in/store-port-in';
import { IStoreRepositoryPort } from '../../domain/ports/out/store-port-out';
import {
  RegisterStoreDto,
  UpdateStoreDto,
  ChangeStoreStatusDto,
} from '../dto/in';
import {
  StoreResponseDto,
  StoreDeletedResponseDto,
} from '../dto/out';
import { StoreMapper } from '../mapper/store.mapper';

@Injectable()
export class StoreCommandService implements IStoreCommandPort {
  constructor(
    @Inject('IStoreRepositoryPort')
    private readonly repository: IStoreRepositoryPort,
  ) {}

  async registerStore(dto: RegisterStoreDto): Promise<StoreResponseDto> {
    const existsByCode = await this.repository.existsByCode(dto.codigo);
    if (existsByCode) {
      throw new ConflictException('Ya existe un almacén con ese código');
    }

    const store = StoreMapper.fromRegisterDto(dto);
    const savedStore = await this.repository.save(store);
    return StoreMapper.toResponseDto(savedStore);
  }

  async updateStore(dto: UpdateStoreDto): Promise<StoreResponseDto> {
    const existingStore = await this.repository.findById(dto.id_almacen);
    if (!existingStore) {
      throw new NotFoundException(`Almacén con ID ${dto.id_almacen} no encontrado`);
    }

    if (dto.codigo && dto.codigo !== existingStore.codigo) {
      const codeExists = await this.repository.existsByCode(dto.codigo);
      if (codeExists) {
        throw new ConflictException('El código ya está en uso por otro almacén');
      }
    }

    const updatedStore = StoreMapper.fromUpdateDto(existingStore, dto);
    const savedStore = await this.repository.update(updatedStore);
    return StoreMapper.toResponseDto(savedStore);
  }

  async changeStoreStatus(dto: ChangeStoreStatusDto): Promise<StoreResponseDto> {
    const existingStore = await this.repository.findById(dto.id_almacen);
    if (!existingStore) {
      throw new NotFoundException(`Almacén con ID ${dto.id_almacen} no encontrado`);
    }

    const updatedStore = StoreMapper.withStatus(existingStore, dto.activo);
    const savedStore = await this.repository.update(updatedStore);
    return StoreMapper.toResponseDto(savedStore);
  }

  async deleteStore(id: number): Promise<StoreDeletedResponseDto> {
    const existingStore = await this.repository.findById(id);
    if (!existingStore) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }

    await this.repository.delete(id);
    return StoreMapper.toDeletedResponse(id);
  }
}
