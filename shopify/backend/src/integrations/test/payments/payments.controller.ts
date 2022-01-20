import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentSession } from 'src/entities/payment-session.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

@Controller('integrations/test/payments')
export class PaymentsController {
  constructor(
    @InjectRepository(PaymentSession)
    private paymentSessionRepository: Repository<PaymentSession>,
    private configService: ConfigService,
  ) {}

  @Get('initiate')
  async initiatePaymentFlow(@Res() res): Promise<PaymentSession[]> {
    const sessionId = v4();

    const result = await this.paymentSessionRepository.insert({
      sessionId,
      integration: 'test',
      meta: {},
    });

    return res.redirect(this.getRedirectUrl(sessionId));
  }

  getRedirectUrl(sessionId: string) {
    return `${this.configService.get<string>(
      'FRONTEND_URL',
    )}?sessionId=${sessionId}`;
  }
}
