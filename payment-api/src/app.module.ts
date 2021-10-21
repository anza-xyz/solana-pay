import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TransactionsModule } from './transactions/transactions.module';
import { RedisService } from './services/redis/redis.service';
import { MemoWatcherService } from './services/memo-watcher/memo-watcher.service';
import { ConnectionService } from './services/connection/connection.service';
import { ShopifyModule } from './integrations/shopify/shopify.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentSession } from 'src/entities/payment-session.entity';
import { TestModule } from './integrations/test/test.module';
import { PaymentsModule } from './payments/payments.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: process.env.MONGO_HOST || 'localhost',
      port: parseInt(process.env.MONGO_PORT) || 27017,
      database: process.env.MONGO_DATABASE || 'payments',
      entities: [PaymentSession],
      username: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
    }),
    TransactionsModule,
    ConfigModule.forRoot(),
    ShopifyModule,
    TestModule,
    PaymentsModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [RedisService, MemoWatcherService, ConnectionService],
})
export class AppModule {}
