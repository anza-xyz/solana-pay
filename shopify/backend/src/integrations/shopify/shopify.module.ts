import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentSession } from 'src/entities/payment-session.entity';
import { PaymentsController } from './payments/payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentSession]), ConfigModule],
  controllers: [PaymentsController],
})
export class ShopifyModule {}
