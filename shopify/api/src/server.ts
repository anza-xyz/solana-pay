global.self = this; // Hack for @solana/pay qr-code-styling

import "reflect-metadata";

require("dotenv").config();

import { Connection, createConnection, getMongoRepository } from "typeorm";
import { Container } from "typescript-ioc";
import { app } from "./app";
import { Merchant, MerchantRepository } from "./entities/Merchant";
import {
  OnboardRequest,
  OnboardRequestRepository,
} from "./entities/OnboardRequest";
import { OnboardSession, OnboardSessionRepository } from "./entities/OnboardSession";
import {
  PaymentSession,
  PaymentSessionRepository,
} from "./entities/PaymentSession";
import { ReferenceService } from "./services/ReferenceService";

const port = process.env.PORT || 3000;

(async () => {
  const connection: Connection = await createConnection({
    type: "mongodb",
    host: process.env.MONGO_HOST || "localhost",
    port: process.env.MONGO_PORT ? parseInt(process.env.MONGO_PORT) : 27017,
    database: process.env.MONGO_DATABASE || "payments",
    entities: [PaymentSession, OnboardRequest, Merchant, OnboardSession],
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
  });

  const referenceService = Container.get(ReferenceService);
  referenceService.start();

  Container.bind(PaymentSessionRepository).factory(() =>
    getMongoRepository(PaymentSession)
  );
  Container.bind(OnboardRequestRepository).factory(() =>
    getMongoRepository(OnboardRequest)
  );
  Container.bind(OnboardSessionRepository).factory(() =>
    getMongoRepository(OnboardSession)
  );
  Container.bind(MerchantRepository).factory(() =>
    getMongoRepository(Merchant)
  );

  app.listen(port, () =>
    console.log(`Shopify integration app listening at http://localhost:${port}`)
  );
})();
