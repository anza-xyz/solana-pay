import { useState } from "react";
import {
  PublicKey, 
  Connection, 
  clusterApiUrl,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import "./styles.css";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';  // THIS CAUSES "CRYPTO" MODULE ERROR UNLESS RESOLVED
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { encodeURL, parseURL, createQR } from "@solana/pay";
import { createTransfer } from "./createTransfer.ts"
// import { QRCodeStyling} from "qr-code-styling";
import BigNumber from "bignumber.js";
require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  new PhantomWalletAdapter()
]

/* REPLACE THIS SENDER ADDRESS WITH YOUR WALLET ADDRESS FROM WHERE YOU WANT TO INITIATE A TRANSFER */
// const sender_wallet_ad = "HZpyGMxawAZy8ENvRtTsdQiwDGeBMtU2Dx1P9DFdRdvu";  // spl-wallet-1
const sender_wallet_ad = "3qupQgH5RaigtFNV7acr7Y9xvcc91F71VCf1szPH1Xej"; // wallet 3
const mercent_wallet_ad = "DqesRRc5fmXcG21HcgeWBsxryJmdYcerE8YzYHHJgoz1";  // wallet 4 escrow
const token_mint_ad = "2iB2oZaJZZBCmMecrz79wrMdu6Zn5UA2apUYdVy4jJUD";
const opts = {
  preflightCommitment: "processed"
}
const network = clusterApiUrl('devnet');

window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  const wallet = useWallet();
  console.log("Wallet Status:", wallet.connected)
  const [isSubmitted, setIsSubmitted] = useState(false);

  // const handleChange = e => {
  //   setTransactionMode(e.target.value)
  // };

  
async function solPay() {
  /**
   * Establish a connection
   */
  const network = clusterApiUrl('devnet');
  const connection = new Connection(network, opts.preflightCommitment);
  
  /**
   * Gather customer checkout info's for url creation
   */
  const recipient = new PublicKey(mercent_wallet_ad);
  const amount = new BigNumber(0.05);
  // const amount = new BigNumber(0.0351515245);
  console.log("LPS:", LAMPORTS_PER_SOL)
  console.log("amount decimal:", amount.decimalPlaces())
  console.log(amount.decimalPlaces() ?? 0)
  console.log("check bool:", amount.decimalPlaces() ?? 0 > 9)
  // if (amount.decimalPlaces() ?? 0 > 9) throw console.log('amount decimals invalid');
  // if (100) throw console.log('amount decimals invalid');
  if ((amount.decimalPlaces() ?? 0) > 9){
    console.log("PASYOOOO")
  }
  else{
    console.log("PASENAAAA")
  }
  console.log('amt:', amount)
  // const amount = new BigNumber(String(0.000000001));
  // amount = amount.times(LAMPORTS_PER_SOL).integerValue(BigNumber.ROUND_FLOOR);
  //  const amount = new BigNumber(0.02);
  const splToken = new PublicKey(token_mint_ad);
  const reference = new PublicKey(sender_wallet_ad);
  const label = 'Nick Store';
  const message = 'Nick Store - Nike Shoes - #001234';
  const memo = 'JC#4098';

  /**
   * Create a payment request link for native SOL transfer
   */
  // const url = encodeURL({ recipient, amount, reference, label, message, memo });
  /**
   * Create a payment request link for SPL Token transfer
   */
   const url = encodeURL({ recipient, amount, splToken, reference, label, message, memo });

  // Transfer req URL scheme 
  // const url =
  // 'solana:DqesRRc5fmXcG21HcgeWBsxryJmdYcerE8YzYHHJgoz1?amount=0.05&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId12345'
    // 'solana:3qupQgH5RaigtFNV7acr7Y9xvcc91F71VCf1szPH1Xej?amount=1&reference=DqesRRc5fmXcG21HcgeWBsxryJmdYcerE8YzYHHJgoz1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';

  console.log("url:", url)

  /**
   * We could also parse the url to get the respective parameters from the encoded url like this
   */
  // const { recipient, amount, splToken, reference, label, message, memo } = parseURL(url);

  console.log("recipient:", recipient)
  console.log("amount:", amount)
  console.log("splToken:", splToken)
  console.log("reference:", reference)
  console.log("label:", label)
  console.log("message:", message)
  console.log("memo:", memo)


/**
 * Adding the QR code to the payment page
 */
  // Styling the QR code
//   const qrCode = new QRCodeStyling({
//     width: 300,
//     height: 300,
//     type: "svg",
//     data: "https://www.facebook.com/",
//     image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
//     dotsOptions: {
//         color: "#4267b2",
//         type: "rounded"
//     },
//     backgroundOptions: {
//         color: "#e9ebee",
//     },
//     imageOptions: {
//         crossOrigin: "anonymous",
//         margin: 20
//     }
// });

  // encode URL in QR code
  const qrCode = createQR(url);

  // get a handle of the element
  const element = document.getElementById('qr-canvas');

  // append QR code to the element
  qrCode.append(element);

  
  /**
 * Set the payer and create the transaction with the required parameters
 */
const payer = window.solana.publicKey;
console.log("payer:", payer)
// const tx = await createTransfer(connection, payer, { recipient, amount, reference, memo });  // For Native SOL
const tx = await createTransfer(connection, payer, { recipient, amount, splToken, reference, memo });  // For Spl Token
console.log("tx:", tx)

/**
 * Sign the transaction and send it to the blockchain and then wait for the confirmation
 */
const signed = await window.solana.signTransaction(tx);
const signature = await connection.sendRawTransaction(signed.serialize());
console.log("signature:", signature)
const finality = "confirmed";
await connection.confirmTransaction(signature, finality);

}

const handleSubmit = async (event) => {
  //Prevent page reload
  event.preventDefault();  
  solPay()
  };

// JSX code for login form
const renderForm = (
  <div className="form">

    <form onSubmit={handleSubmit}>
      <div className="button-container">
        <input type="submit"  value='Send'/>
      </div>
      <div id="qr-canvas">
    
      </div>
    </form>
  </div>
  
);

// ADDED THIS CODE SNIPPET
if (!wallet.connected) {
  /* If the user's wallet is not connected, display connect wallet button. */
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
      <WalletMultiButton />
    </div>
  )
} else {
  return (
    <div className="App">
      <div className="login-form">
        <div className="title">Solana Pay</div>
        {isSubmitted ? <div>User is successfully logged in</div> : renderForm}
      </div>
    </div>
  );
}
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
// <ConnectionProvider endpoint="http://127.0.0.1:8899">
<ConnectionProvider endpoint={network}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      <App />
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
)

export default AppWithProvider;


