import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UnitCommandService } from '../../../application/service/unit-command.service';
import { ChangeUnitStatusDto } from '../../../application/dto/in/update-unit-dto';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('units')
export class UnitRestController {
  constructor(private readonly unitService: UnitCommandService) {}

  @Patch('status/bulk')
  @Roles('CREAR_PRODUCTOS', 'ADMINISTRADOR', 'ADMINISTRACION')
  async changeStatus(@Body() dto: ChangeUnitStatusDto) {
    return await this.unitService.changeStatus(dto);
  }
}
