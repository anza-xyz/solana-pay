import * as express from "express";
import { decodeJWT } from "./services/KeystoreService";

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (!("x-access-token" in request.headers)) {
    return Promise.reject({});
  }

  let token = request.headers["x-access-token"];

  if (Array.isArray(token)) {
    token = token[0];
  }

  try {
    const decoded = decodeJWT(token);
    for (let scope of scopes) {
      if (decoded.scope !== scope) {
        return Promise.reject(new Error("JWT does not contain required scope."));
      }
    }
    return Promise.resolve(decoded);
  } catch (error) {
    return Promise.reject({});
  }
}
