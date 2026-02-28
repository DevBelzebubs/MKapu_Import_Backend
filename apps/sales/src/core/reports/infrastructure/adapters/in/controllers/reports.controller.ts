/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query } from '@nestjs/common';
import { IReportsUseCase } from '../../../../domain/ports/in/reports-use-case';
import { GetSalesReportDto } from '../../../../application/dto/in/get-sales-report.dto';
import { Inject } from '@nestjs/common';
import { GetDashboardFilterDto } from 'apps/sales/src/core/reports/application/dto/in/get-dashboard-filter.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    @Inject('ReportsService')
    private readonly reportsService: IReportsUseCase,
    @Inject('IReportsUseCase')
    private readonly reportsUseCase: IReportsUseCase,
  ) {}

  @Get('sales-dashboard')
  async getSalesDashboard(@Query() filters: GetSalesReportDto) {
    return await this.reportsService.generateSalesReport(filters);
  }
  @Get('dashboard/kpis')
  async getKpis(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getKpis(filters);
  }
  @Get('dashboard/sales-chart')
  async getSalesChart(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getSalesChart(filters);
  }
  @Get('dashboard/top-products')
  async getTopProducts(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getTopProducts(filters);
  }
  @Get('dashboard/top-sellers')
  async getTopSellers(@Query() filters: GetDashboardFilterDto) {
    // GROUP BY employee_id
  }
}
