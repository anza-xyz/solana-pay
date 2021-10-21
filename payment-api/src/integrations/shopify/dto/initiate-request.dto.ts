
// https://shopify.dev/apps/payments/processing-a-payment#request-body

export class InitiateRequestDto {
  id: string;

  gid: string;

  group: string;

  amount: number;

  currency: string;

  test: boolean;

  merchant_locale: string;

  payment_method: any;

  cancel_url: string;

  proposed_at: string;

  customer: any;

  kind: string;
}
