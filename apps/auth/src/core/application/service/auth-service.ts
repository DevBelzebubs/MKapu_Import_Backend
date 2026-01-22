/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountUserPortsIn } from '../../domain/ports/in/account-user-port.in';
import { LoginDto } from '../dto/in/loginDto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from '../dto/out/LoginResponseDto';
import { PasswordHasherPort } from '../../domain/ports/out/password-hash-port-out';
import { AccountUserResponseDto } from '../dto/out/AccountUserResponseDto';
import { AccountUserMapper } from '../mapper/AccountUserMapper';
import { AuthRepository } from '../../infrastructure/adapters/out/repository/auth-repository';

@Injectable()
export class AuthService implements AccountUserPortsIn {
  constructor(
    @Inject('AccountUserPortsOut')
    private readonly repository: AuthRepository,
    private readonly jwtService: JwtService,
    @Inject('PasswordHasherPort')
    private readonly passwordHasher: PasswordHasherPort,
  ) {}
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;
    const user = await this.repository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.estado) {
      throw new UnauthorizedException('La cuenta está desactivada o bloqueada');
    }
    const getPasswordById = await this.repository.getPasswordById(user.id);
    const isPasswordValid = await this.passwordHasher.comparePassword(
      password,
      getPasswordById,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    this.repository
      .updateLastAccess(String(user.id))
      .catch((err) => console.error('Error actualizando ultimo acceso', err));
    const payload = {
      sub: user.id,
      username: user.nombreUsuario,
      role: user.rolNombre,
    };

    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user.id,
        nombre_usuario: user.nombreUsuario,
        email: user.email,
        rol_nombre: user.rolNombre,
      },
    };
  }
  async createAccountForUser(
    userId: number,
    username: string,
    passwordRaw: string,
  ): Promise<AccountUserResponseDto> {
    const hashedPassword = await this.passwordHasher.hashPassword(passwordRaw);
    // 2. Mandar a guardar al repositorio
    const account = await this.repository.createAccount({
      userId,
      username,
      password: hashedPassword,
    });
    const accountOrmEntity = AccountUserMapper.toOrmEntity(account);
    return AccountUserMapper.toAccountUserResponseDto(accountOrmEntity);
  }
}
