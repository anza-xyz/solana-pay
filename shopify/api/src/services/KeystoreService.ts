
import * as keypairs from 'keypairs';
import { Singleton } from 'typescript-ioc';
import jwt from 'jsonwebtoken';
import jwktopem from 'jwk-to-pem';

const EXP = '30m';

let pair;
let publicKey;

keypairs.generate().then((_pair) => {
  pair = _pair;
  publicKey = jwktopem(_pair.public);
});

@Singleton
export class KeystoreService {
  getJwks() {
    return {
      keys: [pair.public],
    };
  }

  getJwt(claims: any) {
    return keypairs.signJwt({
      jwk: pair.private,
      iss: process.env.FRONTEND_URL,
      exp: EXP,
      claims,
    });
  }
}

export function decodeJWT(token: string) {
  return jwt.verify(token, publicKey);
}
