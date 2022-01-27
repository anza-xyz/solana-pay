import {
  Column,
  Entity,
  EntityRepository,
  Generated,
  MongoRepository,
  ObjectID,
  ObjectIdColumn,
  Repository,
} from "typeorm";

import BigNumber from "bignumber.js";

import { encodeURL } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import { Singleton } from "typescript-ioc";
import { InitiatePaymentDto } from "../interfaces/InitiatePaymentDto";

export interface PaymentOption {
  tokenMint?: string;
  tokenSymbol?: string;
  amount: BigNumber;
}

export interface PaymentInformation {
  recipient: string;
  reference: string;
  amount: BigNumber;
  label: string;
  paymentOptions: PaymentOption[];
}

@Entity()
export class PaymentSession {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  @Generated("uuid")
  paymentSessionId: string;

  @Column()
  integration?: string;

  @Column()
  shop: string;

  @Column()
  meta: InitiatePaymentDto;

  @Column()
  reference: string;

  @Column()
  completed?: boolean;

  @Column()
  redirectUrl?: string;

  @Column()
  cancelUrl: string;

  @Column()
  paymentInformation: PaymentInformation;

  static encodeBip(session: PaymentSession): string {
    return encodeURL(
      {
        recipient: new PublicKey(session.paymentInformation.recipient),
        amount: session.paymentInformation.amount,
        reference: new PublicKey(session.paymentInformation.reference),
      }
    );
  }
}

@Singleton
@EntityRepository(PaymentSession)
export class PaymentSessionRepository extends MongoRepository<PaymentSession> {}
