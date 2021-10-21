import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TransactionsModule } from './transactions/transactions.module';
import { RedisService } from './services/redis/redis.service';
import { MemoWatcherService } from './services/memo-watcher/memo-watcher.service';
import { ConnectionService } from './services/connection/connection.service';
import { ShopifyModule } from './integrations/shopify/shopify.module';

@Module({
  imports: [TransactionsModule, ConfigModule.forRoot(), ShopifyModule],
  controllers: [AppController],
  providers: [RedisService, MemoWatcherService, ConnectionService],
})
export class AppModule {}
