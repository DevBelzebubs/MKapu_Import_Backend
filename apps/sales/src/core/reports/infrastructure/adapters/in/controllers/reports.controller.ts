/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query, Inject, UseGuards } from '@nestjs/common';
import { IReportsUseCase } from '../../../../domain/ports/in/reports-use-case';
import { GetSalesReportDto } from '../../../../application/dto/in/get-sales-report.dto';
import { GetDashboardFilterDto } from 'apps/sales/src/core/reports/application/dto/in/get-dashboard-filter.dto';
import { JwtAuthGuard } from '@app/common/infrastructure/guard/jwt-auth.guard';
import { RoleGuard } from '@app/common/infrastructure/guard/roles.guard';
import { Roles } from '@app/common/infrastructure/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    @Inject('IReportsUseCase')
    private readonly reportsUseCase: IReportsUseCase,
  ) {}

  @Get('sales-dashboard')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getSalesDashboard(@Query() filters: GetSalesReportDto) {
    return await this.reportsUseCase.generateSalesReport(filters);
  }

  @Get('dashboard/kpis')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getKpis(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getKpis(filters);
  }

  @Get('dashboard/sales-chart')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getSalesChart(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getSalesChart(filters);
  }

  @Get('dashboard/top-products')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getTopProducts(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getTopProducts(filters);
  }

  @Get('dashboard/top-sellers')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getTopSellers(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getTopSellers(filters);
  }

  @Get('dashboard/payment-methods')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getPaymentMethods(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getPaymentMethods(filters);
  }

  @Get('dashboard/sales-by-district')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getSalesByDistrict(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getSalesByDistrict(filters);
  }

  @Get('dashboard/sales-by-category')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getSalesByCategory(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getSalesByCategory(filters);
  }

  @Get('dashboard/sales-by-headquarter')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getSalesByHeadquarters(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getSalesByHeadquarters(filters);
  }

  @Get('dashboard/recent-sales')
  @Roles(
    'VER_DASHBOARD_VENTAS',
    'VER_REPORTES',
    'VER_VENTAS',
    'ADMINISTRADOR',
    'ADMINISTRACION',
  )
  async getRecentSales(@Query() filters: GetDashboardFilterDto) {
    return await this.reportsUseCase.getRecentSales(filters);
  }
}
