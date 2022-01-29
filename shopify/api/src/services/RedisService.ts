import { Singleton } from "typescript-ioc";
import Redis from 'ioredis';

@Singleton
export class RedisService {
  readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });
  }
}
