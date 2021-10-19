import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';
import { createTransaction } from '../src/createTransaction';
import { parseURL } from '../src/parseURL';

const NATIVE_URL = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId1234';
const USDC_URL = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

(async function() {
    const cluster = 'devnet';
    const endpoint = clusterApiUrl(cluster);
    const connection = new Connection(endpoint, 'confirmed');

    // Wallet gets URL from deep link / QR code
    const { recipient, amount, memo, token } = parseURL(USDC_URL);

    // This just represents the wallet's keypair for testing, in practice it will have a way of signing already
    const wallet = Keypair.generate();

    // Create a transaction to transfer the SOL or tokens
    const transaction = await createTransaction(
        connection,
        wallet.publicKey,
        recipient,
        amount,
        memo,
        token,
    );

    // Sign and send the transaction
    transaction.feePayer = wallet.publicKey;
    transaction.sign(wallet);

    const rawTransaction = transaction.serialize();

    const signature = await connection.sendRawTransaction(rawTransaction);

    // Confirm the transaction
    await connection.confirmTransaction(signature, 'confirmed');

    // Deep link back to the merchant app, or if using a QR code, just tell the user to go back to it
})();

