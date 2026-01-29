
/* ============================================
   sales/src/core/customer/application/service/customer-query.service.ts
   ============================================ */

import { Injectable, Inject } from '@nestjs/common';
import { ICustomerQueryPort } from '../../domain/ports/in/cunstomer-port-in';
import { ICustomerRepositoryPort, IDocumentTypeRepositoryPort } from '../../domain/ports/out/customer-port-out';
import { ListCustomerFilterDto } from '../dto/in';
import {
  CustomerResponseDto,
  CustomerListResponse,
  DocumentTypeResponseDto,
} from '../dto/out';
import { CustomerMapper } from '../mapper/customer.mapper';

@Injectable()
export class CustomerQueryService implements ICustomerQueryPort {
  constructor(
    @Inject('ICustomerRepositoryPort')
    private readonly customerRepository: ICustomerRepositoryPort,
    @Inject('IDocumentTypeRepositoryPort')
    private readonly documentTypeRepository: IDocumentTypeRepositoryPort,
  ) {}

  async listCustomers(filters?: ListCustomerFilterDto): Promise<CustomerListResponse> {
    // Build filters for repository
    const repoFilters = filters
      ? {
          estado: filters.status,
          search: filters.search,
          id_tipo_documento: filters.documentTypeId,
        }
      : undefined;

    // Get customer list
    const customers = await this.customerRepository.findAll(repoFilters);

    // Return formatted response
    return CustomerMapper.toListResponse(customers);
  }

  async getCustomerById(id: string): Promise<CustomerResponseDto | null> {
    // Find customer by ID
    const customer = await this.customerRepository.findById(id);

    // Return null if doesn't exist, or DTO if exists
    return customer ? CustomerMapper.toResponseDto(customer) : null;
  }

  async getCustomerByDocument(documentValue: string): Promise<CustomerResponseDto | null> {
    // Find customer by document
    const customer = await this.customerRepository.findByDocument(documentValue);

    // Return null if doesn't exist, or DTO if exists
    return customer ? CustomerMapper.toResponseDto(customer) : null;
  }

  async getDocumentTypes(): Promise<DocumentTypeResponseDto[]> {
    // Get all document types
    const types = await this.documentTypeRepository.findAll();

    // Map to response DTOs
    return types.map((type) => CustomerMapper.documentTypeToResponseDto(type));
  }
}