import { Body, Controller, Post } from '@nestjs/common';
import { PaymentSessionDto } from 'src/payments/dto/payment-session.dto';
import { KeystoreService } from 'src/security/keystore/keystore.service';

@Controller('payments')
export class PaymentsController {
  constructor(private keystore: KeystoreService) {}

  @Post('session-token')
  async sessionToken(@Body() { sessionId }: PaymentSessionDto) {
    const token = this.keystore.getJwt({
      test: 'foo',
    });

    return token;
  }
}
