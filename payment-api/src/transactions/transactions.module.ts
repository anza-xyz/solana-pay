import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConnectionService } from 'src/services/connection/connection.service';
import { RedisService } from 'src/services/redis/redis.service';
import { MemoWatcherService } from 'src/services/memo-watcher/memo-watcher.service';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [TransactionsController],
  providers: [RedisService, ConnectionService, MemoWatcherService],
})
export class TransactionsModule {}
