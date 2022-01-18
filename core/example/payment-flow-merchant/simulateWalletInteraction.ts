import { Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, SystemProgram } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { parseURL } from '../../src/parseURL';
import { createTransaction } from '../../src/createTransaction';
import { CUSTOMER_WALLET } from './constant';

export async function simulateWalletInteraction(connection: Connection, url: string) {
    const { recipient, message, memo, amount, reference, label } = parseURL(url);
    console.log('label: ', label);
    console.log('message: ', message);

    await getPayer(connection);

    const tx = await createTransaction(connection, CUSTOMER_WALLET.publicKey, recipient, amount as BigNumber, {
        reference,
        memo,
    });

    sendAndConfirmTransaction(connection, tx, [CUSTOMER_WALLET]);
}

async function getPayer(connection: Connection) {
    try {
        const airdropSignature = await connection.requestAirdrop(CUSTOMER_WALLET.publicKey, LAMPORTS_PER_SOL * 2);
        await connection.confirmTransaction(airdropSignature);
    } catch (error) {
        // Fail silently
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return;
}
