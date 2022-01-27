import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  Route,
  Security,
  TsoaResponse,
} from "tsoa";

import fetch from "cross-fetch";
import { checkHmacValidity } from "shopify-hmac-validation";
import { OnboardRequestRepository } from "../entities/OnboardRequest";
import { Inject } from "typescript-ioc";
import { v4 } from "uuid";
import { MerchantRepository } from "../entities/Merchant";
import { KeystoreService } from "../services/KeystoreService";
import { OnboardSessionRepository } from "../entities/OnboardSession";

@Route("onboarding")
export class OnboardingController extends Controller {
  @Inject
  onboardRequestRepository: OnboardRequestRepository;

  @Inject
  merchantRepository: MerchantRepository;

  @Inject
  onboardSessionRepository: OnboardSessionRepository;

  @Inject
  keystore: KeystoreService;

  @Get("install")
  async install(
    @Query() shop: string,
    @Request() req,
    @Res() invalidRequest: TsoaResponse<500, string>
  ) {
    const state = v4();

    if (!checkHmacValidity(process.env.SHOPIFY_API_SECRET, req.query)) {
      return invalidRequest(500, "Invalid hmac");
    }

    await this.onboardRequestRepository.insert({
      shop,
      state,
    });

    return req.res.redirect(this.getShopifyUrl(shop, state));
  }

  @Get("redirect")
  async redirect(
    @Query() shop: string,
    @Query() state: string,
    @Query() code: string,
    @Request() req,
    @Res() invalidRequest: TsoaResponse<500, string>
  ) {
    const request = await this.onboardRequestRepository.findOne({
      where: {
        shop,
        state,
      },
    });

    if (!request) {
      return invalidRequest(500, "Invalid shop or nonce");
    }

    if (!checkHmacValidity(process.env.SHOPIFY_API_SECRET, req.query)) {
      return invalidRequest(500, "Invalid hmac");
    }

    if (!shop.match(/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/)) {
      return invalidRequest(500, "Invalid shop");
    }

    const result = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { access_token } = await result.json();

    await this.merchantRepository.findOneAndUpdate(
      {
        shop,
      },
      {
        $set: {
          shop,
          access_token,
        },
      },
      {
        upsert: true,
      }
    );

    const onboardSessionId = v4();

    await this.onboardSessionRepository.insert({
      shop,
      onboardSessionId,
    });

    const ql = await fetch(
      `https://${shop}/payments_apps/api/2021-10/graphql.json`,
      {
        method: "POST",
        body: JSON.stringify({
          query: `
          mutation PaymentsAppConfigure($externalHandle: String, $ready: Boolean!) {
            paymentsAppConfigure(externalHandle: $externalHandle, ready: $ready) {
                userErrors{
                    field
                    message
                }
            }
          }`,
          variables: {
            externalHandle: "Test Handle",
            ready: true,
          },
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": access_token,
        },
      }
    );

    req.res.redirect(
      `${process.env.FRONTEND_URL}?onboardSessionId=${onboardSessionId}`
    );
  }

  @Get()
  async getSession(
    @Query() onboardSessionId: string,
    @Res() notFoundResponse: TsoaResponse<500, string>
  ) {
    const onboardSession = await this.onboardSessionRepository.findOne({
      onboardSessionId
    });

    const token = await this.keystore.getJwt({
      scope: 'onboarding',
      shop: onboardSession.shop
    });

    return token
  }

  @Post("wallet")
  @Security("api_key", ["onboarding"])
  async saveWallet(
    @Body() { wallet }: any, @Request() req: any
  ) {
    const { shop } = req.user;

    // validate wallet

    await this.merchantRepository.findOneAndUpdate(
      {
        shop,
      },
      {
        $set: {
          shop,
          wallet,
        },
      }
    );
  }

  getShopifyUrl(shop: string, state: string) {
    let url = `https://${shop}/admin/oauth/authorize?`;
    url += `client_id=${process.env.SHOPIFY_API_KEY}`;
    url += `&scope=write_payment_gateways,write_payment_sessions`;
    url += `&redirect_uri=${process.env.BACKEND_URL}/onboarding/redirect`;
    url += `&state=${state}`;
    url += `&grant_options[]=value`;

    return url;
  }
}
