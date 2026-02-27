/* eslint-disable prettier/prettier */
import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { IHeadquartersQueryPort } from '../../../../domain/ports/in/headquarters-ports-in';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HeadquartersOrmEntity } from '../../../entity/headquarters-orm.entity';

type GetSedeByIdPayload = {
  id_sede: string | number;
};

@Controller()
export class SedeTcpController {
  private readonly logger = new Logger(SedeTcpController.name);

  constructor(
    @Inject('IHeadquartersQueryPort')
    private readonly headquartersQueryPort: IHeadquartersQueryPort,
    @InjectRepository(HeadquartersOrmEntity)
    private readonly sedeRepo: Repository<HeadquartersOrmEntity>
  ) {}

  @MessagePattern('get_sede_by_id')
  async getSedeById(@Payload() payload: GetSedeByIdPayload) {
    const idStr = String(payload?.id_sede ?? '').trim();

    this.logger.log(
      `📡 [TCP] get_sede_by_id payload: ${JSON.stringify(payload)}`,
    );

    if (!idStr) {
      return { ok: false, message: 'id_sede es obligatorio', data: null };
    }

    const id = Number(idStr);
    if (Number.isNaN(id)) {
      return { ok: false, message: 'id_sede debe ser numérico', data: null };
    }

    const sedeDto = await this.headquartersQueryPort.getHeadquarterById(id);

    if (!sedeDto) {
      return { ok: true, data: null };
    }

    return {
      ok: true,
      data: {
        id_sede: sedeDto.id_sede,
        nombre: sedeDto.nombre,
      },
    };
  }
  @MessagePattern('get_sedes_nombres')
  async getNamesByIds(
    @Payload() ids: number[],
  ): Promise<Record<number, string>> {
    if (!ids || ids.length === 0) return {};

    const sedes = await this.sedeRepo.find({
      where: { id_sede: In(ids) },
      select: ['id_sede', 'nombre'],
    });

    return sedes.reduce((acc, sede) => {
      acc[sede.id_sede] = sede.nombre;
      return acc;
    }, {});
  }
}
