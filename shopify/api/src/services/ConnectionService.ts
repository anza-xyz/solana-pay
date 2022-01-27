import { Connection } from "@solana/web3.js";
import { Singleton } from "typescript-ioc";

@Singleton
export class ConnectionService {
  readonly connection: Connection;

  constructor() {
    this.connection = new Connection(
      process.env.API_ENDPOINT || 'http://localhost:8899',
    );
  }
}
