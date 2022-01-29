import {
  findTransactionSignature,
  validateTransactionSignature,
} from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import fetch from "cross-fetch";
import { Inject, Singleton } from "typescript-ioc";
import { MerchantRepository } from "../entities/Merchant";
import {
  PaymentSession,
  PaymentSessionRepository,
} from "../entities/PaymentSession";
import { ConnectionService } from "./ConnectionService";
import { RedisService } from "./RedisService";

const POLL_INTERVAL = 10000;
const REDIS_SET = "references";

@Singleton
export class ReferenceService {
  interval: NodeJS.Timeout;

  @Inject
  redisService: RedisService;

  @Inject
  connectionService: ConnectionService;

  @Inject
  paymentSessionRepository: PaymentSessionRepository;

  @Inject
  merchantSessionRepository: MerchantRepository;

  async completePayment(reference: string, payment: PaymentSession) {
    const merchant = await this.merchantSessionRepository.findOne({
      shop: payment.shop,
    });

    if (payment.integration === "shopify") {
      const ql = await fetch(
        `https://${payment.shop}/payments_apps/api/2021-10/graphql.json`,
        {
          method: "POST",
          body: JSON.stringify({
            query: `
          mutation PaymentSessionResolve($id: ID!) {
            paymentSessionResolve(id: $id) {
              paymentSession {
                id
                status {
                  code
                }
                nextAction {
                  action
                  context {
                    ... on PaymentSessionActionsRedirect {
                      redirectUrl
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }`,
            variables: {
              id: payment.meta.id,
            },
          }),
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": merchant.access_token,
          },
        }
      );

      const res = await ql.json();

      await this.paymentSessionRepository.findOneAndUpdate(
        {
          reference,
        },
        {
          $set: {
            completed: true,
            redirectUrl:
              res.data.paymentSessionResolve.paymentSession.nextAction.context
                .redirectUrl,
          },
        }
      );
    } else {
      await this.paymentSessionRepository.findOneAndUpdate(
        {
          reference,
        },
        {
          $set: {
            completed: true,
          },
        }
      );
    }

    await this.redisService.redis.srem(REDIS_SET, reference);
  }

  start() {
    this.interval = setInterval(async () => {
      try {
        let references = await this.redisService.redis.smembers(REDIS_SET);

        for (let reference of references) {
          const session = await this.paymentSessionRepository.findOne({
            reference,
          });

          try {
            const signature = await findTransactionSignature(
              this.connectionService.connection,
              new PublicKey(reference)
            );

            const response = await validateTransactionSignature(
              this.connectionService.connection,
              signature.signature,
              new PublicKey(session.paymentInformation.recipient),
              new BigNumber(session.paymentInformation.amount),
              session.paymentInformation.paymentOptions[0].tokenMint
                ? new PublicKey(
                    session.paymentInformation.paymentOptions[0].tokenMint
                  )
                : undefined,
              new PublicKey(reference)
            );

            this.completePayment(reference, session);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }, POLL_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
