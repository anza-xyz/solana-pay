import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { clusterApiUrl } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo } from 'react';
import { Payment } from './pages/Payment';
import { SessionProvider, useSession } from './hooks/useSession';
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope';
import { PaymentProvider } from './hooks/usePayment';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Onboard } from './pages/Onboard';

require('./app.scss');

require('@solana/wallet-adapter-react-ui/styles.css');

export const App: FC = () => {
  return (
    <Context>
      <Content />
    </Context>
  );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new TorusWalletAdapter(),
    new SlopeWalletAdapter()
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <SessionProvider>
          <PaymentProvider>
            {children}
          </PaymentProvider>
        </SessionProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content: FC = () => {
  const { scope } = useSession();

  switch (scope) {
    case "payment":
      return <Payment />;
    case "onboarding":
      return <Onboard />;
    default:
      return null;
  }
}
