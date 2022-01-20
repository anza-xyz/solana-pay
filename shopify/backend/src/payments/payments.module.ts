import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeystoreService } from 'src/security/keystore/keystore.service';
import { SecurityModule } from 'src/security/security.module';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  imports: [SecurityModule],
  providers: [KeystoreService, ConfigService],
})
export class PaymentsModule {}
