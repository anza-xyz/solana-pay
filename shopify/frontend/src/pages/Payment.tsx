import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useEffect } from 'react';
import { SendingIndicator } from '../components/SendingIndicator';
import { GoBack } from '../components/GoBack';
import { SolanaPay } from '../components/SolanaPay';
import { USDC } from '../components/USDC';
import { VintaaageLogo } from '../components/VintaaageLogo';
import { PaymentStatus, usePayment } from '../hooks/usePayment';
import { SuccessIcon } from '../components/SuccessIcon';
import { ErrorIcon } from '../components/ErrorIcon';
import { QRCode } from '../components/QRCode';
import { PaymentSessionContextState, useSession } from '../hooks/useSession';

export const Payment: FC = () => {
  const { status } = usePayment();
  const { paymentInformation }: PaymentSessionContextState = useSession();

  return (
    <div className="container pt-4">
      <div className="d-flex mb-4">
        <div className="flex-1">
          <GoBack />
        </div>
        <div>
          <SolanaPay />
        </div>
        <div className="flex-1"></div>
      </div>

      {/* <div className="d-flex justify-content-center">
        <p>
          Pay United by Blue
        </p>
      </div> */}

      <div className="d-flex justify-content-center">
        <h2 className="payment-amount">
          <USDC />
            {paymentInformation.paymentOptions[0].amount} USDC
        </h2>
      </div>

      {status === PaymentStatus.Initialized && <BuyOptions />}

      {status === PaymentStatus.Connecting && <ConnectingWallet />}

      {status === PaymentStatus.Sending && <SendingPayment />}

      {status === PaymentStatus.Success && <Success />}

      {status === PaymentStatus.Error && <Error />}

    </div>
  );
};

const BuyOptions: FC = () => {
  const { wallets, select } = useWallet();

  const { setStatus, setReason, sendPayment } = usePayment();
  return (
    <div className="d-flex justify-content-center row">
      <div className="col-md-6 col-sm-8">
        <div className="d-flex mt-4">
          <h5>How do you want to pay?</h5>
        </div>

        {wallets.map(wallet => {
          if (wallet.readyState === WalletReadyState.Unsupported || wallet.readyState !== WalletReadyState.Loadable && wallet.readyState !== WalletReadyState.Installed) {
            return null;
          }

          return <div className="d-flex wallet-row justify-content-center" key={wallet.adapter.name}>
            <div className="flex-shrink-0">
              <img src={wallet.adapter.icon} />
            </div>
            <div className="flex-fill">
              {wallet.adapter.name}
            </div>
            <div className="select-button">
              <div onClick={async () => {
                await select(wallet.adapter.name);
                setStatus(PaymentStatus.Connecting);
                try {
                  await wallet.adapter.connect();
                  setStatus(PaymentStatus.Sending);
                } catch (error) {
                  setReason("Something bad happened");
                  setStatus(PaymentStatus.Initialized);
                }
              }}>
                Select
            </div>
            </div>
          </div>
        })}

        <p className="p-5 text-center">
          Alternatively, you can open a Solana-compatable wallet and scan this code to pay for this transaction.
        </p>

        <div className="d-flex justify-content-center">
          <QRCode />
        </div>
      </div>
    </div>
  );
};

const ConnectingWallet: FC = () => {
  const { setStatus } = usePayment();
  const { wallet } = useWallet();
  return (
    <div className="opening-wallet">
      <div className="d-flex justify-content-center mt-5">
        <div className="col-md-6 col-sm-8">
          <h4 className="text-center">Opening {wallet?.adapter.name}&hellip;</h4>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <VintaaageLogo />
        <div className="p-4">
          <SendingIndicator />
        </div>
        <img src={wallet?.adapter.icon} />
      </div>
      <div className="d-flex justify-content-center mt-3">
        <p>If you don't see anything, click <a href={wallet?.adapter.url} target="_blank" onClick={() => {
          setStatus(PaymentStatus.Initialized);
        }}>here</a></p>
      </div>
    </div>
  );
};

const SendingPayment: FC = () => {
  const { sendPayment } = usePayment();
  const { wallet, publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    sendPayment();
  }, [publicKey]);

  return (
    <div className="opening-wallet">
      <div className="d-flex justify-content-center mt-5">
        <div className="col-md-6 col-sm-8">
          <h4 className="text-center">Paying United by Blue</h4>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <img src={wallet?.adapter.icon} />
        <div className="p-4">
          <SendingIndicator />
        </div>
        <VintaaageLogo />

      </div>
      {/* <div className="d-flex justify-content-center mt-3">
        <p>If you don't see anything, click <a href={walletAdapter?.url} target="_blank" onClick={() => {
          setStatus(PaymentStatus.Initialized);
        }}>here</a></p>
      </div> */}
    </div>
  )
}

const Success: FC = () => {
  const { wallet } = useWallet();

  return (
    <div className="opening-wallet">
      <div className="d-flex justify-content-center mt-5">
        <div className="col-md-6 col-sm-8">
          <h4 className="text-center">Payment Successful</h4>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <img src={wallet?.adapter.icon} />
        <div className="p-4">
          <SuccessIcon />
        </div>
        <VintaaageLogo />

      </div>
      <div className="d-flex justify-content-center mt-3">
        <p>If you’re not automatically redirected back to the merchant in a few seconds, click here.</p>
      </div>
    </div>
  );
};

const Error: FC = () => {
  const { wallet } = useWallet();

  return (
    <div className="opening-wallet">
      <div className="d-flex justify-content-center mt-5">
        <div className="col-md-6 col-sm-8">
          <h4 className="text-center">Payment failed</h4>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <img src={wallet?.adapter.icon} />
        <div className="p-4">
          <ErrorIcon />
        </div>
        <VintaaageLogo />

      </div>
      <div className="d-flex justify-content-center mt-3">
        <p>If you’re not automatically redirected back to the merchant in a few seconds, click here.</p>
      </div>
    </div>
  );
};
