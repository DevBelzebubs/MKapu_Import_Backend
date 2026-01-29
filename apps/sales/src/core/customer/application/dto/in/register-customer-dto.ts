/* ============================================
   sales/src/core/customer/application/dto/in/register-customer-dto.ts
   ============================================ */

export interface RegisterCustomerDto {
  documentTypeId: number;
  documentValue: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
}
