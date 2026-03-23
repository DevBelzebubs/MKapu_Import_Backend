import {
  Controller,
  Get,
  Query,
  Inject,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ISalesBookUseCase } from '../../../../domain/ports/in/sales-book-use-case';
import { GetSalesBookDto } from '../../../../application/dto/in/get-sales-book.dto';
import { SalesBookResponseDto } from '../../../../application/dto/out/sales-book-response.dto';
import { JwtAuthGuard } from 'libs/common/src/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from 'libs/common/src/infrastructure/guard/roles.guard';
import { Roles } from 'libs/common/src/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('accounting/sales-book')
export class SalesBookController {
  constructor(
    @Inject(ISalesBookUseCase)
    private readonly salesBookUseCase: ISalesBookUseCase,
  ) {}

  @Get()
  @Roles('VER_LIBRO_VENTAS', 'VER_REPORTES', 'ADMINISTRADOR', 'ADMINISTRACION')
  async getSalesBook(
    @Query(new ValidationPipe({ transform: true })) query: GetSalesBookDto,
  ): Promise<SalesBookResponseDto> {
    return this.salesBookUseCase.generateSalesBookReport(query);
  }
}
