import { Module } from '@nestjs/common';
import { PaymentsController } from './payments/payments.controller';

@Module({
  controllers: [PaymentsController],
})
export class ShopifyModule {}
