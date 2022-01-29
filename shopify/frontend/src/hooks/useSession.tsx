import { Session } from "inspector";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import jwt from 'jsonwebtoken';
import jwktopem from 'jwk-to-pem';
import { useQuery } from "./useQuery";

export interface PaymentOption {
  tokenMint?: string;
  tokenSymbol?: string;
  amount: number;
}

export interface PaymentInformation {
  recipient: string;
  reference: string;
  paymentOptions: PaymentOption[];
}

export interface PaymentSessionContextState {
  scope: 'payment';
  paymentInformation: PaymentInformation;
  paymentSessionId: string;
  paymentUrl: string;
}

export interface OnboardingSessionContextState {
  scope: 'onboarding';
}

export type SessionContextState = PaymentSessionContextState & OnboardingSessionContextState;

export const SessionContext = createContext<SessionContextState>({} as SessionContextState);

export type SaveWallet = Function;

export const SaveWalletContext = createContext<SaveWallet | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  console.log('Session Provider');

  const paymentSessionId = useQuery().get('paymentSessionId');
  const onboardSessionId = useQuery().get('onboardSessionId');

  const [session, setSession] = useState<SessionContextState>({} as SessionContextState);
  const [token, setToken] = useState<string|undefined>(undefined);

  const saveWallet = useCallback(async (wallet) => {

    console.log(wallet);

    const request = await fetch(`${process.env.REACT_APP_PAYMENTS_API_URL}/onboarding/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': `${token}`
      },
      body: JSON.stringify({
        wallet
      })
    });

    console.log(await request.json());

  }, [session, token]);

  useEffect(() => {
    (async () => {
      try {
        if (paymentSessionId || onboardSessionId) {
          delete sessionStorage['jwt'];
          window.history.replaceState(null, '', window.location.origin);
        }

        const jwksRequest = await fetch(`${process.env.REACT_APP_PAYMENTS_API_URL}/security/jwks.json`);
        const jwks = await jwksRequest.json();
        const [key] = jwks.keys;
        const publicKey = jwktopem(key);

        let token = sessionStorage['jwt'];

        if (!token && !paymentSessionId && !onboardSessionId) {
          // error, redirect.
        }

        if (!token) {
          const route = paymentSessionId ? `/payment-session?paymentSessionId=${paymentSessionId}` : `/onboarding?onboardSessionId=${onboardSessionId}`;

          const jwtRequest = await fetch(`${process.env.REACT_APP_PAYMENTS_API_URL}${route}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          token = await jwtRequest.json();
        }

        sessionStorage['jwt'] = token;

        setToken(token);

        const decoded = jwt.verify(token, publicKey) as SessionContextState;

        setSession(decoded);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SessionContext.Provider value={session}>
      <SaveWalletContext.Provider value={saveWallet}>
        {children}
      </SaveWalletContext.Provider>
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext);
}

export function useSaveWallet() {
  return useContext(SaveWalletContext);
}
