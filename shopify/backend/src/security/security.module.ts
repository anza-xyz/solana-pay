import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeystoreService } from './keystore/keystore.service';
import { JwksController } from './jwks/jwks.controller';

@Module({
  imports: [ConfigModule],
  providers: [KeystoreService],
  controllers: [JwksController],
})
export class SecurityModule {}
