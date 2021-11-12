import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';
import { encodeURL } from '../src/app';
import { createTransaction, parseURL } from '../src/wallet';

const NATIVE_URL = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId1234';
const USDC_URL = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

(async function() {
    const cluster = 'devnet';
    const endpoint = clusterApiUrl(cluster);
    const connection = new Connection(endpoint, 'confirmed');

    // Wallet gets URL from deep link / QR code
    const { recipient, amount, token, references, label, message, memo } = parseURL(USDC_URL);

    // Apps can encode the URL from the required and optional parameters
    const url = encodeURL(recipient, amount, token, references, label, message, memo);

    // This just represents the wallet's keypair for testing, in practice it will have a way of signing already
    const wallet = Keypair.generate();

    // Create a transaction to transfer native SOL or SPL tokens
    const transaction = await createTransaction(
        connection,
        wallet.publicKey,
        recipient,
        amount,
        token,
        references,
        memo,
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

