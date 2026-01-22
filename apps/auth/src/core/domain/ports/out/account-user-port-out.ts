/* auth/src/core/domain/ports/out/account-user-port-out.ts */
import { AccountUser } from '../../entity/account-user';

export interface AccountUserPortsOut {
  findByUsername(username: string): Promise<AccountUser | null>;

  createAccount(data: {
    userId: number;
    username: string;
    password: string;
  }): Promise<AccountUser>;

  updateLastAccess(accountId: string): Promise<void>;

  updatePassword(id: string, newPassword: string): Promise<void>;

  getProfileData(id: string): Promise<any>;

  getPasswordById(id: string): Promise<string | null>;

  findById(id: string): Promise<AccountUser | null>;
}
