import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { createContext, FC, useCallback, useContext, useState } from "react";
import { PaymentSessionContextState, useSession } from "./useSession";
import { createTransaction } from "@solana/pay";
import { BigNumber } from "bignumber.js";
import { PublicKey } from "@solana/web3.js";

export enum PaymentStatus {
  Initialized = 'Initialized',
  Connecting = 'Connecting',
  Sending = 'Sending',
  Success = 'Success',
  Error = 'Error'
};

export interface PaymentContextState {
  status: PaymentStatus;
  setStatus(status: PaymentStatus): void;
  reason?: string;
  setReason(reason: string): void;
  sendPayment(): void;
  signature?: string;
  setSignature(signature: string): void;
}

export const PaymentContext = createContext<PaymentContextState>({} as PaymentContextState);

export const PaymentProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState(PaymentStatus.Initialized);
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [signature, setSignature] = useState<string | undefined>(undefined);

  const { wallet, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const session: PaymentSessionContextState = useSession();

  const sendPayment = useCallback(async () => {
    if (!publicKey) {
      // do something else
      return;
    }

    let symbol;

    const paymentOption = session.paymentInformation.paymentOptions[0];

    if (!paymentOption.tokenMint) {
      symbol = 'SOL'
    } else if (paymentOption.tokenMint && paymentOption.tokenSymbol) {
      symbol = paymentOption.tokenSymbol;
    } else if (paymentOption.tokenMint) {
      symbol = 'Unknown Token';
    }

    try {
      const transaction = await createTransaction(connection, publicKey, new PublicKey(session.paymentInformation.recipient),
        new BigNumber(paymentOption.amount),
        {
          reference: new PublicKey(session.paymentInformation.reference)
        }
      );

      const signature = await sendTransaction(transaction, connection);

      setSignature(signature);

      setStatus(PaymentStatus.Success);
    } catch (error) {
      console.log(error);
      setStatus(PaymentStatus.Error);
    }
  }, [session, wallet, publicKey]);

  return (
    <PaymentContext.Provider value={{
      status,
      setStatus,
      reason,
      setReason,
      sendPayment,
      setSignature,
      signature
    }}>
      {children}
    </PaymentContext.Provider>
  )
};

export const usePayment = () => {
  return useContext(PaymentContext);
};
