
/* ============================================
   sales/src/core/customer/domain/entity/customer-domain-entity.ts
   ============================================ */

export interface CustomerProps {
  id_cliente?: string;              // DB field - Spanish
  id_tipo_documento: number;        // DB field - Spanish
  valor_doc: string;                // DB field - Spanish
  nombres: string;                  // DB field - Spanish
  direccion?: string;               // DB field - Spanish
  email?: string;                   // DB field - Spanish
  telefono?: string;                // DB field - Spanish
  estado?: boolean;                 // DB field - Spanish
  // Enriched data from relations
  tipoDocumentoDescripcion?: string;
  tipoDocumentoCodSunat?: string;
}

export class Customer {
  private constructor(private readonly props: CustomerProps) {
    this.validate();
  }

  static create(props: CustomerProps): Customer {
    return new Customer(props);
  }

  private validate(): void {
    if (!this.props.valor_doc || this.props.valor_doc.trim().length === 0) {
      throw new Error('Document value is required');
    }
    if (!this.props.nombres || this.props.nombres.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!this.props.id_tipo_documento) {
      throw new Error('Document type is required');
    }
  }

  get id_cliente(): string | undefined {
    return this.props.id_cliente;
  }

  get id_tipo_documento(): number {
    return this.props.id_tipo_documento;
  }

  get valor_doc(): string {
    return this.props.valor_doc;
  }

  get nombres(): string {
    return this.props.nombres;
  }

  get direccion(): string | undefined {
    return this.props.direccion;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get telefono(): string | undefined {
    return this.props.telefono;
  }

  get estado(): boolean {
    return this.props.estado ?? true;
  }

  get tipoDocumentoDescripcion(): string | undefined {
    return this.props.tipoDocumentoDescripcion;
  }

  get tipoDocumentoCodSunat(): string | undefined {
    return this.props.tipoDocumentoCodSunat;
  }

  getDisplayName(): string {
    return this.props.nombres;
  }

  getInvoiceType(): 'BOLETA' | 'FACTURA' {
    // SUNAT code '6' = RUC
    return this.props.tipoDocumentoCodSunat === '6' ? 'FACTURA' : 'BOLETA';
  }
}
