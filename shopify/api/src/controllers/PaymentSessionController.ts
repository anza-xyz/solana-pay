import { Get, Request } from "@tsoa/runtime";
import { Query } from "@tsoa/runtime";
import { Route } from "@tsoa/runtime";
import { Controller } from "@tsoa/runtime";
import { Body, Post, Res, TsoaResponse } from "tsoa";
import { Inject } from "typescript-ioc";
import {
  PaymentSession,
  PaymentSessionRepository,
} from "../entities/PaymentSession";
import { checkHmacValidity } from "shopify-hmac-validation";
import { InitiatePaymentDto } from "../interfaces/InitiatePaymentDto";
import { RedirectUrl } from "../interfaces/RedirectUrl";
import { KeystoreService } from "../services/KeystoreService";
import { v4 } from "uuid";
import { MerchantRepository } from "../entities/Merchant";
import { Keypair } from "@solana/web3.js";
import { RedisService } from "../services/RedisService";

const REDIS_SET = 'references';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

@Route("payment-session")
export class PaymentSessionController extends Controller {
  @Inject
  keystore: KeystoreService;

  @Inject
  redisService: RedisService;

  @Inject
  paymentSessionRepository: PaymentSessionRepository;

  @Inject
  merchantRepository: MerchantRepository;

  @Get()
  async getPaymentSession(
    @Query() paymentSessionId: string,
    @Res() notFoundResponse: TsoaResponse<404, string>
  ): Promise<string> {
    const paymentSession = await this.paymentSessionRepository.findOne({
      paymentSessionId,
    });

    if (!paymentSession) {
      return notFoundResponse(404, "Payment session not found.");
    }

    const token = await this.keystore.getJwt({
      scope: 'payment',
      paymentSessionId,
      paymentInformation: paymentSession.paymentInformation,
      paymentUrl: PaymentSession.encodeBip(paymentSession),
      cancelUrl: paymentSession.cancelUrl
    });

    return token;
  }

  @Post("initiate")
  async initiatePayment(
    @Body() body: InitiatePaymentDto,
    @Request() req,
    @Res() invalidRequest: TsoaResponse<500, string>
  ): Promise<RedirectUrl> {
    const paymentSessionId = v4();

    if (!checkHmacValidity(process.env.SHOPIFY_API_SECRET, req.query)) {
      return invalidRequest(500, "Invalid hmac");
    }

    const reference = Keypair.generate().publicKey.toString();

    const { shop } = req.query;
    const { cancel_url } = body;

    const merchant = await this.merchantRepository.findOne({
      shop
    });

    await this.redisService.redis.sadd(REDIS_SET, reference);

    await this.paymentSessionRepository.create({
      paymentSessionId,
      integration: "shopify",
      meta: body,
      shop,
      reference,
      cancelUrl: cancel_url,
      paymentInformation: {
        amount: body.amount,
        recipient: merchant.wallet,
        reference,
        paymentOptions: [{
          amount: body.amount,
          tokenSymbol: 'USDC',
          tokenMint: USDC_MINT,
        }]
      }
    });

    return {
      redirect_url: this.getRedirectUrl(paymentSessionId),
    };
  }


  async complete() {

  }

  @Post("refund")
  async refund() {
    return true;
  }

  getRedirectUrl(paymentSessionId: string) {
    return `${process.env.FRONTEND_URL}?paymentSessionId=${paymentSessionId}`;
  }
}
