import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as keypairs from 'keypairs';

// TODO: this is all temporary!

const EXP = '30m';

let pair;

keypairs.generate().then((_pair) => {
  pair = _pair;
});

@Injectable()
export class KeystoreService {
  constructor(private configService: ConfigService) {}

  getJwks() {
    return {
      keys: [pair.public],
    };
  }

  getJwt(claims: any) {
    return keypairs.signJwt({
      jwk: pair.private,
      iss: this.configService.get<string>('FRONTEND_URL'),
      exp: EXP,
      claims,
    });
  }
}
