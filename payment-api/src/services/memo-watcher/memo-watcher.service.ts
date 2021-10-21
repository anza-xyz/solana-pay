import { Injectable } from '@nestjs/common';
import { ConfirmedSignatureInfo, Connection, PublicKey } from '@solana/web3.js';
import { ConnectionService } from 'src/services/connection/connection.service';
import { RedisService } from 'src/services/redis/redis.service';
import Redis from 'ioredis';

const REDIS_SET = 'transactions';
const MEMO_PROGRAM = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);
const POLL_INTERVAL = 5000;

@Injectable()
export class MemoWatcherService {
  connection: Connection;
  redis: Redis;
  interval;
  lastSignature;

  constructor(
    private connectionService: ConnectionService,
    private redisService: RedisService,
  ) {
    this.connection = connectionService.getConnection();
    this.redis = redisService.getRedis();

    this.redis.scard(REDIS_SET).then((cardinality) => {
      if (cardinality > 0) {
        this.start();
      }
    });
  }

  start() {
    this.interval = setInterval(async () => {
      let signatures = await this.connection.getSignaturesForAddress(
        MEMO_PROGRAM,
        {
          until: this.lastSignature,
        },
      );
      if (signatures.length > 0) {
        this.lastSignature = signatures[0].signature;
        this.checkSignatures(signatures);
      }
    }, POLL_INTERVAL);
  }

  private checkSignatures(signatures: ConfirmedSignatureInfo[]) {
    signatures.forEach((signature) => console.log(signature.memo));
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async watchTransactionId(transactionId: string) {
    await this.redis.sadd(REDIS_SET, transactionId);
  }
}
