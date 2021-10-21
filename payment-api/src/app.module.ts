import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PaymentsModule } from './payments/payments.module';
import { RedisService } from './services/redis/redis.service';
import { MemoWatcherService } from './services/memo-watcher/memo-watcher.service';
import { ConnectionService } from './services/connection/connection.service';

@Module({
  imports: [PaymentsModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [RedisService, MemoWatcherService, ConnectionService],
})
export class AppModule {}
