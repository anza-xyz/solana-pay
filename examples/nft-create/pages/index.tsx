import { createQR, encodeURL, TransactionRequestURLFields } from '@solana/pay';
import { useEffect, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PostResponse as CheckoutPostResponse, PostError as CheckoutPostError } from './api/checkout';
import { Transaction } from '@solana/web3.js';

const generateQRCode = (url, size, bgColor) => {
  // createQR function
};

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const mintQrRef = useRef<HTMLDivElement>();

  // Separate function for generating Solana Pay QR code
  const generateSolanaPayQRCode = () => {
    const { location } = window;
    const apiUrl = `${location.protocol}//${location.host}/api/checkout`;

    const mintUrlFields: TransactionRequestURLFields = {
      link: new URL(apiUrl),
    };
    const mintUrl = encodeURL(mintUrlFields);
    const mintQr = generateQRCode(mintUrl, 400, 'transparent');

    if (mintQrRef.current) {
      mintQrRef.current.innerHTML = '';
      mintQr?.append(mintQrRef.current);
    }
  };

  useEffect(() => {
    generateSolanaPayQRCode();
  }, []);

  // Handler for performing the transaction with a connected wallet
  async function buy(e: React.MouseEvent) {
    e.preventDefault();

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: publicKey?.toBase58() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.status}`);
      }

      const responseBody = await response.json() as CheckoutPostResponse | CheckoutPostError;

      if ('error' in responseBody) {
        const error = responseBody.error;
        console.error(error);
        alert(`Error fetching transaction: ${error}`);
        return;
      }

      // Deserialize the transaction to send
      const transaction = Transaction.from(Buffer.from(responseBody.transaction, 'base64'));
      await sendTransaction(transaction, connection);
      alert('Purchase complete!');
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    }
  }

  return (
    <main className="container flex flex-col gap-20 items-center p-4 mx-auto min-h-screen justify-center">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl">Buy in your browser...</h1>
        <div className="basis-1/4"><WalletMultiButton /></div>
        <button
          type="button"
          className="max-w-fit inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!publicKey}
          onClick={buy}
        >
          Buy now
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <h1 className="text-3xl">Or scan QR code</h1>
        <div ref={mintQrRef} />
      </div>
    </main>
  );
}
