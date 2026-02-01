/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymentPortsOut } from '../../../domain/ports/out/payment-ports-out';
@Injectable()
export class CulqiPaymentAdapter implements PaymentPortsOut {
  constructor(@Inject('CULQI_CLIENT') private readonly culqiClient: any) {}
  async createCharge(
    amount: number,
    currency: string,
    sourceId: string,
    email: string,
  ): Promise<any> {
    try {
      const charge = await this.culqiClient.charges.create({
        amount,
        currency_code: currency,
        email,
        source_id: sourceId,
        description: 'Venta desde POS/Backend',
      });

      return charge;
    } catch (error) {
      console.error('Error procesando pago con Culqi:', error);
      throw new InternalServerErrorException('Error al procesar el pago');
    }
  }
}
