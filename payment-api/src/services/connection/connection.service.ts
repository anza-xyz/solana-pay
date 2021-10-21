import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';

@Injectable()
export class ConnectionService {
  private connection: Connection;

  constructor(private configService: ConfigService) {
    this.connection = new Connection(
      configService.get<string>('API_ENDPOINT') || 'http://localhost:8899'
    );
  }

  getConnection(): Connection {
    return this.connection;
  }
}
