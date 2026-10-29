/** Payment method as returned (JSON-serialised) from the server actions. */
export interface PaymentMethodDTO {
  _id: string;
  name: string;
  balance: number;
}
