import { Get, Route, Request } from "tsoa";
import { Inject } from "typescript-ioc";
import { PaymentSessionRepository } from "../entities/PaymentSession";
import { v4 } from "uuid";
import { Keypair } from "@solana/web3.js";
import { OnboardSessionRepository } from "../entities/OnboardSession";
import { RedisService } from "../services/RedisService";

const REDIS_SET = 'references';

@Route("test")
export class TestController {
  @Inject
  paymentSessionRepository: PaymentSessionRepository;

  @Inject
  onboardSessionRepository: OnboardSessionRepository;

  @Inject
  redisService: RedisService;


  @Get("initiate")
  async initiate(@Request() req) {
    const paymentSessionId = v4();

    const reference = Keypair.generate().publicKey.toString();

    await this.redisService.redis.sadd(REDIS_SET, reference);

    const result = await this.paymentSessionRepository.insert({
      paymentSessionId,
      integration: "test",
      meta: {},
      reference,
      paymentInformation: {
        recipient: "8HHPdNSLhTTsiYnMVBNp6myH37VQjJQh2ZVNQ5Fpdd4B",
        reference,
        paymentOptions: [
          {
            amount: 0.001,
          },
          // {
          //   amount: 200,
          //   tokenSymbol: 'USDC',
          //   tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          // },
        ],
      },
    });

    return req.res.redirect(this.getRedirectUrl(paymentSessionId));
  }

  @Get("onboard")
  async onboard(@Request() req) {
    const onboardSessionId = v4();

    const result = await this.onboardSessionRepository.insert({
      onboardSessionId,
      shop: 'test-shop'
    });

    return req.res.redirect(
      `${process.env.FRONTEND_URL}?onboardSessionId=${onboardSessionId}`
    );
  }

  getRedirectUrl(paymentSessionId: string) {
    return `${process.env.FRONTEND_URL}?paymentSessionId=${paymentSessionId}`;
  }
}
