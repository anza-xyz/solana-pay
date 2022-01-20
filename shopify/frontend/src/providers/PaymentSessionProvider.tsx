import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useQuery } from "../utils/url";
import jwktopem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import fetch from 'cross-fetch';

export type PaymentSession = any; // tbd

const PaymentSessionContext = React.createContext<PaymentSession | undefined>(undefined);

type PaymentScopeProviderProps = { children: React.ReactNode };

export function PaymentSessionProvider({ children }: PaymentScopeProviderProps) {
  const sessionId = useQuery().get('sessionId');
  const location = useLocation();

  const [decoded, setDecoded] = useState<undefined | PaymentSession>(undefined);
  const [sessionEstablished, setSessionEstablished] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (sessionId) {
          delete sessionStorage['jwt'];
        }

        const jwksRequest = await fetch('http://localhost:3000/v1/jwks.json');
        const jwks = await jwksRequest.json();
        const [key] = jwks.keys;
        const publicKey = jwktopem(key);

        let token = sessionStorage['jwt'];

        if (!token && !sessionId) {
          return setError(true);
        }

        if (!token) {
          const jwtRequest = await fetch(`http://localhost:3000/v1/payments/session-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sessionId
            })
          });
          token = await jwtRequest.text();
        }

        const decoded = jwt.verify(token, publicKey);
        sessionStorage['jwt'] = token;
        setDecoded(decoded);
        setSessionEstablished(true);
      } catch (error) {
        setError(true);
      }
    })()
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <Redirect to="/error" push />
    );
  }

  if (!sessionEstablished) {
    return null;
  }

  if (sessionEstablished && location.pathname !== '/pay') {
    return (
      <Redirect to="/pay" push />
    );
  }

  return (
    <PaymentSessionContext.Provider value={decoded}>
      {children}
    </PaymentSessionContext.Provider>
  );
}

export function usePaymentSession() {
  const context = React.useContext(PaymentSessionContext);
  if (!context) {
    throw new Error('usePaymentSession must be used within a PaymentSessionProvider');
  }
  return context;
}
