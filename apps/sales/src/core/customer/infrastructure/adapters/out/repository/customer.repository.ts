
/* ============================================
   sales/src/core/customer/infrastructure/adapters/out/repository/customer.repository.ts
   ============================================ */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICustomerRepositoryPort } from '../../../../domain/ports/out/customer-port-out';
import { Customer } from '../../../../domain/entity/customer-domain-entity';
import { CustomerOrmEntity } from '../../../entity/customer-orm.entity';
import { CustomerMapper } from '../../../../application/mapper/customer.mapper';

@Injectable()
export class CustomerRepository implements ICustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly customerOrmRepository: Repository<CustomerOrmEntity>,
  ) {}

  async save(customer: Customer): Promise<Customer> {
    const customerOrm = CustomerMapper.toOrmEntity(customer);
    const saved = await this.customerOrmRepository.save(customerOrm);
    
    // Cargar la relación con tipo_documento
    const savedWithRelation = await this.customerOrmRepository.findOne({
      where: { id_cliente: saved.id_cliente },
      relations: ['tipoDocumento'],
    });
    
    return CustomerMapper.toDomainEntity(savedWithRelation!);
  }

  async update(customer: Customer): Promise<Customer> {
    const customerOrm = CustomerMapper.toOrmEntity(customer);
    await this.customerOrmRepository.update(customer.id_cliente!, customerOrm);
    
    const updated = await this.customerOrmRepository.findOne({
      where: { id_cliente: customer.id_cliente },
      relations: ['tipoDocumento'],
    });
    
    return CustomerMapper.toDomainEntity(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.customerOrmRepository.delete(id);
  }

  async findById(id: string): Promise<Customer | null> {
    const customerOrm = await this.customerOrmRepository.findOne({
      where: { id_cliente: id },
      relations: ['tipoDocumento'],
    });
    return customerOrm ? CustomerMapper.toDomainEntity(customerOrm) : null;
  }

  async findByDocument(valor_doc: string): Promise<Customer | null> {
    const customerOrm = await this.customerOrmRepository.findOne({
      where: { valor_doc },
      relations: ['tipoDocumento'],
    });
    return customerOrm ? CustomerMapper.toDomainEntity(customerOrm) : null;
  }

  async findAll(filters?: {
    estado?: boolean;
    search?: string;
    id_tipo_documento?: number;
  }): Promise<Customer[]> {
    const queryBuilder = this.customerOrmRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.tipoDocumento', 'tipoDocumento');

    if (filters?.estado !== undefined) {
      queryBuilder.andWhere('cliente.estado = :estado', {
        estado: filters.estado,
      });
    }

    if (filters?.id_tipo_documento) {
      queryBuilder.andWhere('cliente.id_tipo_documento = :id_tipo_documento', {
        id_tipo_documento: filters.id_tipo_documento,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(cliente.valor_doc LIKE :search OR cliente.nombres LIKE :search OR cliente.email LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const customersOrm = await queryBuilder.getMany();
    return customersOrm.map((custOrm) => CustomerMapper.toDomainEntity(custOrm));
  }

  async existsByDocument(valor_doc: string): Promise<boolean> {
    const count = await this.customerOrmRepository.count({ 
      where: { valor_doc } 
    });
    return count > 0;
  }
}
