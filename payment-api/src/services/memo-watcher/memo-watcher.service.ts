import { Injectable } from '@nestjs/common';
import { ConfirmedSignatureInfo, Connection, PublicKey } from '@solana/web3.js';
import { ConnectionService } from 'src/services/connection/connection.service';
import { RedisService } from 'src/services/redis/redis.service';

const REDIS_SET = 'transactions';
const MEMO_PROGRAM = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);
const POLL_INTERVAL = 5000;

@Injectable()
export class MemoWatcherService {
  interval: NodeJS.Timeout;
  lastSignature: string;

  constructor(
    private connectionService: ConnectionService,
    private redisService: RedisService,
  ) {
    this.start();
  }

  start() {
    this.interval = setInterval(async () => {
      try {
        let signatures =
          await this.connectionService.connection.getSignaturesForAddress(
            MEMO_PROGRAM,
            {
              until: this.lastSignature,
            },
          );
        if (signatures.length > 0) {
          this.lastSignature = signatures[0].signature;
          this.checkSignatures(signatures);
        }
      } catch (error) {
        console.error(error);
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
    await this.redisService.redis.sadd(REDIS_SET, transactionId);
  }
}
