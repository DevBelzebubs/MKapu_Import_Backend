export interface PaymentPortsOut {
  createCharge(
    amount: number,
    currency: string,
    sourceId: string,
    email: string,
  ): Promise<any>;
}
