import { Controller, Get } from '@nestjs/common';
import { KeystoreService } from 'src/security/keystore/keystore.service';

@Controller('jwks.json')
export class JwksController {
  constructor(private keystoreService: KeystoreService) {}

  @Get()
  getJwks(): any {
    return this.keystoreService.getJwks();
  }
}
