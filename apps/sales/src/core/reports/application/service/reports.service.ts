/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Inject, Injectable } from '@nestjs/common';
import { IReportsUseCase } from '../../domain/ports/in/reports-use-case';
import { SalesReportRow } from '../../domain/entity/sales-report-row.entity';
import { GetSalesReportDto } from '../dto/in/get-sales-report.dto';
import { IReportsRepositoryPort } from '../../domain/ports/out/reports-repository.port';
import { GetDashboardFilterDto } from '../dto/in/get-dashboard-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerOrmEntity } from '../../../customer/infrastructure/entity/customer-orm.entity';
import { SalesReceiptOrmEntity } from '../../../sales-receipt/infrastructure/entity/sales-receipt-orm.entity';

@Injectable()
export class ReportsService implements IReportsUseCase {
  constructor(
    @Inject('IReportsRepositoryPort')
    private readonly reportsRepository: IReportsRepositoryPort,
    @InjectRepository(SalesReceiptOrmEntity)
    private readonly salesReceiptRepository: Repository<SalesReceiptOrmEntity>,

    @InjectRepository(CustomerOrmEntity)
    private readonly customerRepository: Repository<CustomerOrmEntity>,
  ) {}
  async generateSalesReport(
    filters: GetSalesReportDto,
  ): Promise<SalesReportRow[]> {
    return await this.reportsRepository.getSalesDashboard(filters);
  }
  async getKpis(filters: GetDashboardFilterDto) {
    const { startDate, endDate, prevStartDate, prevEndDate } =
      this.calculateDates(filters.periodo);

    // Obtener data actual
    const currentKpis = await this.reportsRepository.getKpisData(
      startDate,
      endDate,
      filters.id_sede,
    );
    const currentClientes = await this.reportsRepository.getTotalClientes(
      startDate,
      endDate,
    );

    // Obtener data anterior para calcular variaciones
    const prevKpis = await this.reportsRepository.getKpisData(
      prevStartDate,
      prevEndDate,
      filters.id_sede,
    );
    const prevClientes = await this.reportsRepository.getTotalClientes(
      prevStartDate,
      prevEndDate,
    );

    const ticketPromedio =
      currentKpis.totalOrdenes > 0
        ? currentKpis.totalVentas / currentKpis.totalOrdenes
        : 0;
    const prevTicketPromedio =
      prevKpis.totalOrdenes > 0
        ? prevKpis.totalVentas / prevKpis.totalOrdenes
        : 0;

    return {
      totalVentas: currentKpis.totalVentas,
      totalOrdenes: currentKpis.totalOrdenes,
      ticketPromedio: ticketPromedio,
      nuevosClientes: currentClientes,
      variaciones: {
        ventas: this.calculatePercentage(
          currentKpis.totalVentas,
          prevKpis.totalVentas,
        ),
        ordenes: this.calculatePercentage(
          currentKpis.totalOrdenes,
          prevKpis.totalOrdenes,
        ),
        ticket: this.calculatePercentage(ticketPromedio, prevTicketPromedio),
        clientes: this.calculatePercentage(currentClientes, prevClientes),
      },
    };
  }

  calculatePercentage(current: number, previous: number): Promise<number> {
    if (previous === 0) return Promise.resolve(current > 0 ? 100 : 0);
    return Promise.resolve(
      parseFloat((((current - previous) / previous) * 100).toFixed(2)),
    );
  }

  private calculateDates(periodo: string) {
    const endDate = new Date();
    const startDate = new Date();
    const prevEndDate = new Date();
    const prevStartDate = new Date();

    if (periodo === 'semana') {
      startDate.setDate(endDate.getDate() - 7);
      prevEndDate.setDate(startDate.getDate() - 1);
      prevStartDate.setDate(prevEndDate.getDate() - 7);
    } else if (periodo === 'mes') {
      startDate.setMonth(endDate.getMonth() - 1);
      prevEndDate.setDate(startDate.getDate() - 1);
      prevStartDate.setMonth(prevEndDate.getMonth() - 1);
    } else if (periodo === 'trimestre') {
      startDate.setMonth(endDate.getMonth() - 3);
      prevEndDate.setDate(startDate.getDate() - 1);
      prevStartDate.setMonth(prevEndDate.getMonth() - 3);
    } else if (periodo === 'anio') {
      startDate.setFullYear(endDate.getFullYear(), 0, 1);
      prevEndDate.setFullYear(endDate.getFullYear() - 1, 11, 31);
      prevStartDate.setFullYear(endDate.getFullYear() - 1, 0, 1);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    prevStartDate.setHours(0, 0, 0, 0);
    prevEndDate.setHours(23, 59, 59, 999);

    return { startDate, endDate, prevStartDate, prevEndDate };
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
      totalVentas: parseFloat(result.totalVentas || '0'),
      totalOrdenes: parseInt(result.totalOrdenes || '0', 10),
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
  async getSalesChart(filters: GetDashboardFilterDto) {
    const { startDate, endDate } = this.calculateDates(filters.periodo);
    const rawData = await this.reportsRepository.getSalesChartData(
      startDate,
      endDate,
    );
    const labels: string[] = [];
    const values: number[] = [];
    rawData.forEach((row) => {
      const date = new Date(row.fecha);
      const dia = `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleDateString('es-PE', { month: 'short' })}`;

      labels.push(dia);
      values.push(parseFloat(row.total));
    });

    return { labels, values };
  }
  async getTopProducts(filters: GetDashboardFilterDto) {
    const { startDate, endDate } = this.calculateDates(filters.periodo);

    const rawData = await this.reportsRepository.getTopProductsData(
      startDate,
      endDate,
      5,
    );
    return rawData.map((item) => ({
      nombre: item.nombre,
      ventas: parseInt(item.ventas, 10),
      ingresos: `S/ ${parseFloat(item.ingresos).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    }));
  }
}
