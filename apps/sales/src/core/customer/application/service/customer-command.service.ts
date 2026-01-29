
/* ============================================
   sales/src/core/customer/application/service/customer-command.service.ts
   ============================================ */

import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICustomerCommandPort } from '../../domain/ports/in/cunstomer-port-in';
import { ICustomerRepositoryPort, IDocumentTypeRepositoryPort } from '../../domain/ports/out/customer-port-out';
import {
  RegisterCustomerDto,
  UpdateCustomerDto,
  ChangeCustomerStatusDto,
} from '../dto/in';
import {
  CustomerResponseDto,
  CustomerDeletedResponseDto,
} from '../dto/out';
import { CustomerMapper } from '../mapper/customer.mapper';

@Injectable()
export class CustomerCommandService implements ICustomerCommandPort {
  constructor(
    @Inject('ICustomerRepositoryPort')
    private readonly customerRepository: ICustomerRepositoryPort,
    @Inject('IDocumentTypeRepositoryPort')
    private readonly documentTypeRepository: IDocumentTypeRepositoryPort,
  ) {}

  async registerCustomer(dto: RegisterCustomerDto): Promise<CustomerResponseDto> {
    // Validate document type exists
    const documentType = await this.documentTypeRepository.findById(dto.documentTypeId);
    if (!documentType) {
      throw new BadRequestException(
        `Document type with ID ${dto.documentTypeId} does not exist`,
      );
    }

    // Validate document doesn't exist
    const exists = await this.customerRepository.existsByDocument(dto.documentValue);
    if (exists) {
      throw new ConflictException(
        `A customer with document ${dto.documentValue} already exists`,
      );
    }

    // Create domain entity from DTO
    const customer = CustomerMapper.fromRegisterDto(dto);

    // Save to repository
    const savedCustomer = await this.customerRepository.save(customer);

    // Return response DTO
    return CustomerMapper.toResponseDto(savedCustomer);
  }

  async updateCustomer(dto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    // Find existing customer
    const existingCustomer = await this.customerRepository.findById(dto.customerId);
    if (!existingCustomer) {
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found`,
      );
    }

    // Update domain entity
    const updatedCustomer = CustomerMapper.fromUpdateDto(existingCustomer, dto);

    // Save changes
    const savedCustomer = await this.customerRepository.update(updatedCustomer);

    // Return response DTO
    return CustomerMapper.toResponseDto(savedCustomer);
  }

  async changeCustomerStatus(dto: ChangeCustomerStatusDto): Promise<CustomerResponseDto> {
    // Find existing customer
    const existingCustomer = await this.customerRepository.findById(dto.customerId);
    if (!existingCustomer) {
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found`,
      );
    }

    // Change status
    const customerWithNewStatus = CustomerMapper.withStatus(
      existingCustomer,
      dto.status,
    );

    // Save changes
    const savedCustomer = await this.customerRepository.update(customerWithNewStatus);

    // Return response DTO
    return CustomerMapper.toResponseDto(savedCustomer);
  }

  async deleteCustomer(id: string): Promise<CustomerDeletedResponseDto> {
    // Verify customer exists
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Delete from repository
    await this.customerRepository.delete(id);

    // Return confirmation
    return CustomerMapper.toDeletedResponse(id);
  }
}