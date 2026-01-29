
/* ============================================
   sales/src/core/customer/application/mapper/customer.mapper.ts
   ============================================ */

import { Customer } from '../../domain/entity/customer-domain-entity';
import { DocumentType } from '../../domain/entity/document-type-domain-entity';
import { RegisterCustomerDto, UpdateCustomerDto } from '../dto/in';
import { 
  CustomerResponseDto, 
  CustomerListResponse, 
  CustomerDeletedResponseDto,
  DocumentTypeResponseDto 
} from '../dto/out';
import { CustomerOrmEntity } from '../../infrastructure/entity/customer-orm.entity';
import { DocumentTypeOrmEntity } from '../../infrastructure/entity/document-type-orm.entity';
import { v4 as uuidv4 } from 'uuid';

export class CustomerMapper {
  // Domain Entity (Spanish fields) → Response DTO (English fields)
  static toResponseDto(customer: Customer): CustomerResponseDto {
    return {
      customerId: customer.id_cliente!,
      documentTypeId: customer.id_tipo_documento,
      documentTypeDescription: customer.tipoDocumentoDescripcion!,
      documentTypeSunatCode: customer.tipoDocumentoCodSunat!,
      documentValue: customer.valor_doc,
      name: customer.nombres,
      address: customer.direccion,
      email: customer.email,
      phone: customer.telefono,
      status: customer.estado,
      displayName: customer.getDisplayName(),
      invoiceType: customer.getInvoiceType(),
    };
  }

  static toListResponse(customers: Customer[]): CustomerListResponse {
    return {
      customers: customers.map((c) => this.toResponseDto(c)),
      total: customers.length,
    };
  }

  // Register DTO (English fields) → Domain Entity (Spanish fields)
  static fromRegisterDto(dto: RegisterCustomerDto): Customer {
    return Customer.create({
      id_cliente: uuidv4(),
      id_tipo_documento: dto.documentTypeId,
      valor_doc: dto.documentValue,
      nombres: dto.name,
      direccion: dto.address,
      email: dto.email,
      telefono: dto.phone,
      estado: true,
    });
  }

  // Update DTO (English fields) → Domain Entity (Spanish fields)
  static fromUpdateDto(customer: Customer, dto: UpdateCustomerDto): Customer {
    return Customer.create({
      id_cliente: customer.id_cliente,
      id_tipo_documento: customer.id_tipo_documento,
      valor_doc: customer.valor_doc,
      nombres: dto.name ?? customer.nombres,
      direccion: dto.address ?? customer.direccion,
      email: dto.email ?? customer.email,
      telefono: dto.phone ?? customer.telefono,
      estado: customer.estado,
      tipoDocumentoDescripcion: customer.tipoDocumentoDescripcion,
      tipoDocumentoCodSunat: customer.tipoDocumentoCodSunat,
    });
  }

  static withStatus(customer: Customer, status: boolean): Customer {
    return Customer.create({
      id_cliente: customer.id_cliente,
      id_tipo_documento: customer.id_tipo_documento,
      valor_doc: customer.valor_doc,
      nombres: customer.nombres,
      direccion: customer.direccion,
      email: customer.email,
      telefono: customer.telefono,
      estado: status,
      tipoDocumentoDescripcion: customer.tipoDocumentoDescripcion,
      tipoDocumentoCodSunat: customer.tipoDocumentoCodSunat,
    });
  }

  static toDeletedResponse(customerId: string): CustomerDeletedResponseDto {
    return {
      customerId,
      message: 'Customer deleted successfully',
      deletedAt: new Date(),
    };
  }

  // ORM Entity (Spanish fields) → Domain Entity (Spanish fields)
  static toDomainEntity(customerOrm: CustomerOrmEntity): Customer {
    let estado = true;
    if (typeof customerOrm.estado === 'boolean') {
      estado = customerOrm.estado;
    } else if (typeof customerOrm.estado === 'number') {
      estado = customerOrm.estado === 1;
    } else if (Buffer.isBuffer(customerOrm.estado)) {
      estado = (customerOrm.estado as any)[0] === 1;
    }

    return Customer.create({
      id_cliente: customerOrm.id_cliente,
      id_tipo_documento: customerOrm.id_tipo_documento,
      valor_doc: customerOrm.valor_doc,
      nombres: customerOrm.nombres,
      direccion: customerOrm.direccion,
      email: customerOrm.email,
      telefono: customerOrm.telefono,
      estado: estado,
      tipoDocumentoDescripcion: customerOrm.tipoDocumento?.descripcion,
      tipoDocumentoCodSunat: customerOrm.tipoDocumento?.cod_sunat,
    });
  }

  // Domain Entity (Spanish fields) → ORM Entity (Spanish fields)
  static toOrmEntity(customer: Customer): CustomerOrmEntity {
    const customerOrm = new CustomerOrmEntity();
    customerOrm.id_cliente = customer.id_cliente!;
    customerOrm.id_tipo_documento = customer.id_tipo_documento;
    customerOrm.valor_doc = customer.valor_doc;
    customerOrm.nombres = customer.nombres;
    customerOrm.direccion = customer.direccion || null;
    customerOrm.email = customer.email || null;
    customerOrm.telefono = customer.telefono || null;
    customerOrm.estado = customer.estado ?? true;
    return customerOrm;
  }

  // Document Type ORM → Document Type Domain
  static documentTypeToDomain(docTypeOrm: DocumentTypeOrmEntity): DocumentType {
    return DocumentType.create({
      id_tipo_documento: docTypeOrm.id_tipo_documento,
      cod_sunat: docTypeOrm.cod_sunat,
      descripcion: docTypeOrm.descripcion,
    });
  }

  // Document Type Domain → Response DTO (English fields)
  static documentTypeToResponseDto(docType: DocumentType): DocumentTypeResponseDto {
    return {
      documentTypeId: docType.id_tipo_documento,
      sunatCode: docType.cod_sunat,
      description: docType.descripcion,
    };
  }
}