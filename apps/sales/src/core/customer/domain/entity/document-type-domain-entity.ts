
/* ============================================
   sales/src/core/customer/domain/entity/document-type.ts
   ============================================ */

export interface DocumentTypeProps {
  id_tipo_documento: number;  // DB field - Spanish
  cod_sunat: string;           // DB field - Spanish
  descripcion: string;         // DB field - Spanish
}

export class DocumentType {
  private constructor(private readonly props: DocumentTypeProps) {}

  static create(props: DocumentTypeProps): DocumentType {
    return new DocumentType(props);
  }

  get id_tipo_documento(): number {
    return this.props.id_tipo_documento;
  }

  get cod_sunat(): string {
    return this.props.cod_sunat;
  }

  get descripcion(): string {
    return this.props.descripcion;
  }
}