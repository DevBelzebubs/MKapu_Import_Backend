/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { IReportsRepositoryPort } from '../../../../domain/ports/out/reports-repository.port';
import { GetSalesReportDto } from '../../../../application/dto/in/get-sales-report.dto';
import { SalesReportRow } from '../../../../domain/entity/sales-report-row.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerOrmEntity } from 'apps/sales/src/core/customer/infrastructure/entity/customer-orm.entity';
import { SalesReceiptOrmEntity } from 'apps/sales/src/core/sales-receipt/infrastructure/entity/sales-receipt-orm.entity';

@Injectable()
export class ReportsTypeOrmRepository implements IReportsRepositoryPort {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SalesReceiptOrmEntity)
    private readonly salesReceiptRepository: Repository<SalesReceiptOrmEntity>,
    @InjectRepository(CustomerOrmEntity)
    private readonly customerRepository: Repository<CustomerOrmEntity>,
  ) {}
  async getSalesDashboard(
    filters: GetSalesReportDto,
  ): Promise<SalesReportRow[]> {
    const { startDate, endDate, sedeId, vendedorId } = filters;
    let whereClause = `WHERE cv.fec_emision BETWEEN ? AND ?`;
    const parameters: any[] = [startDate, endDate];
    if (sedeId) {
      whereClause += ` AND cv.sede_id = ?`;
      parameters.push(sedeId);
    }
    if (vendedorId) {
      whereClause += ` AND cv.vendedor_id = ?`;
      parameters.push(vendedorId);
    }
    if (vendedorId) {
      whereClause += ` AND cv.vendedor_id = ?`;
      parameters.push(vendedorId);
    }
    const query = `
      SELECT 
        cv.id_comprobante,
        cv.serie,
        cv.numero,
        cv.fec_emision,
        cv.total,
        cv.estado,
        cv.cod_moneda,
        tc.descripcion as tipo_comprobante,
        c.nombres as cliente_nombre,
        c.valor_doc as cliente_doc,
        s.nombre as sede_nombre,
        CONCAT(u.nombres, ' ', u.ape_pat) as vendedor_nombre
      FROM mkp_ventas.comprobante_venta cv
      INNER JOIN mkp_ventas.tipo_comprobante tc ON cv.id_tipo_comprobante = tc.id_tipo_comprobante
      INNER JOIN mkp_ventas.cliente c ON cv.id_cliente = c.id_cliente
      -- Cruzamos con Admin DB para nombres descriptivos
      INNER JOIN mkp_administracion.sede s ON cv.id_sede_ref = s.id_sede
      INNER JOIN mkp_administracion.usuario u ON cv.id_responsable_ref = u.id_usuario
      ${whereClause}
      ORDER BY cv.fec_emision DESC
    `;
    const results = await this.dataSource.query(query, parameters);
    return results.map(
      (row: any) =>
        new SalesReportRow(
          row.id_comprobante,
          row.serie,
          row.numero,
          new Date(row.fec_emision),
          row.tipo_comprobante,
          row.cliente_nombre,
          row.cliente_doc,
          row.cod_moneda,
          Number(row.total),
          row.estado,
          row.sede_nombre,
          row.vendedor_nombre,
        ),
    );
  }
  async getKpisData(
    startDate: Date,
    endDate: Date,
    id_sede?: string,
  ): Promise<{ totalVentas: number; totalOrdenes: number }> {
    const query = this.salesReceiptRepository
      .createQueryBuilder('sr')
      .select('SUM(sr.total)', 'totalVentas')
      .addSelect('COUNT(sr.id)', 'totalOrdenes')
      .where('sr.fec_emision BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('sr.estado = :estado', { estado: true });

    if (id_sede) {
      query.andWhere('sr.id_sede = :id_sede', { id_sede });
    }

    const result = await query.getRawOne();
    return {
      totalVentas: parseFloat(result.totalVentas || 0),
      totalOrdenes: parseInt(result.totalOrdenes || 0),
    };
  }

  async getTotalClientes(startDate: Date, endDate: Date): Promise<number> {
    return await this.customerRepository
      .createQueryBuilder('c')
      .where('c.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();
  }
  async getSalesChartData(startDate: Date, endDate: Date): Promise<any[]> {
    return await this.salesReceiptRepository
      .createQueryBuilder('sr')
      .select('DATE(sr.fec_emision)', 'fecha')
      .addSelect('SUM(sr.total)', 'total')
      .where('sr.fec_emision BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('sr.estado = :estado', { estado: true })
      .groupBy('DATE(sr.fec_emision)')
      .orderBy('fecha', 'ASC')
      .getRawMany();
  }
  async getTopProductsData(
    startDate: Date,
    endDate: Date,
    limit: number = 5,
  ): Promise<any[]> {
    return await this.salesReceiptRepository
      .createQueryBuilder('sr')
      .innerJoin('sr.detalles', 'detail')
      .select('detail.descripcion', 'nombre')
      .addSelect('SUM(detail.cantidad)', 'ventas')
      .addSelect('SUM(detail.cantidad * detail.pre_uni)', 'ingresos')
      .where('sr.fec_emision BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('sr.estado = :estado', { estado: true })
      .groupBy('detail.descripcion')
      .orderBy('ingresos', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
