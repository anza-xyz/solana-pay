import { Get, Route } from "@tsoa/runtime";
import { Inject } from "typescript-ioc";
import { KeystoreService } from "../services/KeystoreService";

@Route('security')
export class SecurityController {

  @Inject
  keystoreService: KeystoreService;

  @Get('/jwks.json')
  getJwks() {
    return this.keystoreService.getJwks();
  }

}
