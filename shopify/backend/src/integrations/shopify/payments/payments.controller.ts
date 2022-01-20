import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentSession } from 'src/entities/payment-session.entity';
import { InitiateRequestDto } from 'src/integrations/shopify/dto/initiate-request.dto';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

interface RedirectUrl {
  redirect_url: string;
}

@Controller('integrations/shopify/payments')
export class PaymentsController {
  constructor(
    @InjectRepository(PaymentSession)
    private paymentSessionRepository: Repository<PaymentSession>,
    private configService: ConfigService,
  ) {}

  @Post('initiate')
  async initiatePayment(
    @Body() body: InitiateRequestDto,
  ): Promise<RedirectUrl> {
    const sessionId = v4();

    await this.paymentSessionRepository.create({
      sessionId,
      integration: 'shopify',
      meta: body,
    });

    return {
      redirect_url: this.getRedirectUrl(sessionId),
    };
  }

  getRedirectUrl(sessionId: string) {
    return `${this.configService.get<string>(
      'FRONTEND_URL',
    )}?sessionId=${sessionId}`;
  }
}
