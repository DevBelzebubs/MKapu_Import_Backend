
/* ============================================
   administration/src/core/permission/application/dto/out/permission-list-response.ts
   ============================================ */

import { PermissionResponseDto } from './permission-reponse-dto';

export interface PermissionListResponse {
  permissions: PermissionResponseDto[];
  total: number;
}