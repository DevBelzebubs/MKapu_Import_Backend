/* ============================================
   sales/src/core/customer/application/dto/in/update-customer-dto.ts
   ============================================ */

export interface UpdateCustomerDto {
  customerId: string;
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
}