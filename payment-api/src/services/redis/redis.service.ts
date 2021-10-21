import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  readonly redis: Redis;

  constructor(configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get<string>('REDIS_HOST') || 'localhost',
      port: configService.get<string>('REDIS_PORT') || 6379,
    });
  }
}
