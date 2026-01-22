/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* auth/src/core/infrastructure/repository/auth-repository.ts */

/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AccountUserPortsOut } from 'apps/auth/src/core/domain/ports/out/account-user-port-out';
import { AccountUserOrmEntity, UserOrmEntity } from '../../../entity/account-user-orm-entity';
import { DataSource, Repository } from 'typeorm';
import { AccountUser } from 'apps/auth/src/core/domain/entity/account-user';
import { AccountUserMapper } from 'apps/auth/src/core/application/mapper/AccountUserMapper';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthRepository implements AccountUserPortsOut {
  private readonly userRepo: Repository<AccountUserOrmEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepo = this.dataSource.getRepository(AccountUserOrmEntity);
  }
  async findByUsername(username: string): Promise<AccountUser | null> {
    const userEntity = await this.userRepo.findOne({
      where: { nom_usu: username, activo: true },
      relations: ['usuario', 'roles'],
    });

    return userEntity ? AccountUserMapper.toDomainEntity(userEntity) : null;
  }

  async createAccount(data: { userId: number; username: string; password: string }): Promise<AccountUser> {
    const newAccount = this.userRepo.create({
      id_cuenta: uuidv4(), // Generamos ID manualmente ya que es VARCHAR(255)
      nom_usu: data.username,
      contraseña: data.password,
      // 'email_emp' e 'id_sede' son NOT NULL en tu script. Debes definirlos.
      // Aquí pongo valores por defecto, pero deberías recibirlos en 'data' si es posible.
      email_emp: `${data.username}@empresa.com`, 
      id_sede: 1, 
      activo: true,
      ultimo_acceso: new Date(),
    });
    const userRef = new UserOrmEntity();
    userRef.id_usuario = data.userId;

    newAccount.usuario = userRef;
    try {
      await this.userRepo.save(newAccount);
      return AccountUserMapper.toDomainEntity(newAccount);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El username ya está en uso');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<AccountUser | null> {
    const userEntity = await this.userRepo.findOne({
      where: { id_cuenta: id },
      relations: ['usuario', 'roles'],
    });

    return userEntity ? AccountUserMapper.toDomainEntity(userEntity) : null;
  }

  async updateLastAccess(accountId: string): Promise<void> {
    await this.userRepo.update(accountId, { ultimo_acceso: new Date() });
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const result = await this.userRepo.update(id, { contraseña: newPassword });
    if (result.affected === 0) throw new Error('Usuario no encontrado.');
  }

  async getPasswordById(id: string): Promise<string | null> {
    const user = await this.userRepo.findOne({
      where: { id_cuenta: id },
      select: ['contraseña'],
    });
    return user ? user.contraseña : null;
  }

  async getProfileData(id: string): Promise<any> {
    return await this.dataSource.query(
      `SELECT 
        u.id_usuario, 
        u.usu_nom, 
        u.ape_pat, 
        u.ape_mat,
        u.dni, 
        u.email, 
        u.celular, 
        u.direccion, 
        cu.username, 
        r.nombre_rol as rol
       FROM usuario u
       INNER JOIN cuenta_usuario cu ON cu.id_usuario = u.id_usuario
       LEFT JOIN cuenta_usuario_roles cur ON cur.id_cuenta_usuario = cu.id_cuenta_usuario
       LEFT JOIN rol r ON cur.id_rol = r.id_rol
       WHERE u.id_usuario = ? AND u.activo = 1`,
      [id],
    );
  }
}
