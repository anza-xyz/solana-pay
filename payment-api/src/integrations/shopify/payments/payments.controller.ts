import { Body, Controller, Post } from '@nestjs/common';
import { InitiateRequestDto } from 'src/integrations/shopify/dto/initiate-request.dto';

@Controller('integrations/shopify/payments')
export class PaymentsController {
  @Post('initiate')
  initiatePayment(@Body() body: InitiateRequestDto) {
    return {
      redirect_url: 'https://someurl/'
    };
  }
}
