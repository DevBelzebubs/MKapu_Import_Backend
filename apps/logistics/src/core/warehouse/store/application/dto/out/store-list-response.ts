
// logistics/src/core/warehouse/store/application/dto/out/store-list-response.ts
import { StoreResponseDto } from './store-response-dto';

export interface StoreListResponse {
  stores: StoreResponseDto[];
  total: number;
}