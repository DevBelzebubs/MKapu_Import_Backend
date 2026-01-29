/* ============================================
   sales/src/core/customer/application/dto/out/customer-deleted-response-dto.ts
   ============================================ */

export interface CustomerDeletedResponseDto {
  customerId: string;
  message: string;
  deletedAt: Date;
}