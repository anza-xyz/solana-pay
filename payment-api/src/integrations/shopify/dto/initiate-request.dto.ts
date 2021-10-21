// https://shopify.dev/apps/payments/processing-a-payment#request-body

import { ApiProperty } from '@nestjs/swagger';

export class InitiateRequestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  gid: string;

  @ApiProperty()
  group: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  test: boolean;

  @ApiProperty()
  merchant_locale: string;

  @ApiProperty()
  payment_method: any;

  @ApiProperty()
  cancel_url: string;

  @ApiProperty()
  proposed_at: string;

  @ApiProperty()
  customer: any;

  @ApiProperty()
  kind: string;
}
