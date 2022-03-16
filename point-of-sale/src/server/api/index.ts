import { createTransfer } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { NextApiHandler } from 'next';
import { connection } from '../core';
import { cors, rateLimit } from '../middleware';

interface GetResponse {
    label: string,
    icon: string,
}

interface PostResponse {
    transaction: string,
    message?: string,
}

const get: NextApiHandler<GetResponse> = async (request, response) => {
    const labelField = request.query.label;
    if (!labelField) throw new Error('missing label');
    if (typeof labelField !== "string") throw new Error('invalid label')

    const host = request.headers.host;
    const icon = `https://${host}/SolanaPayLogo.svg`;

    response.status(200).send({
        label: labelField,
        icon,
    })
}

const post: NextApiHandler<PostResponse> = async (request, response) => {
    /*
    Transfer request params provided in the URL by the app client. In practice, these should be generated on the server,
    persisted along with an unpredictable opaque ID representing the payment, and the ID be passed to the app client,
    which will include the ID in the transaction request URL. This prevents tampering with the transaction request.
    */
    const recipientField = request.query.recipient;
    if (!recipientField) throw new Error('missing recipient');
    if (typeof recipientField !== 'string') throw new Error('invalid recipient');
    const recipient = new PublicKey(recipientField);

    const amountField = request.query.amount;
    if (!amountField) throw new Error('missing amount');
    if (typeof amountField !== 'string') throw new Error('invalid amount');
    const amount = new BigNumber(amountField);

    const splTokenField = request.query.splToken;
    if (splTokenField && typeof splTokenField !== 'string') throw new Error('invalid splToken');
    const splToken = splTokenField ? new PublicKey(splTokenField) : undefined;

    const referenceField = request.query.reference;
    if (!referenceField) throw new Error('missing reference');
    if (typeof referenceField !== 'string') throw new Error('invalid reference');
    const reference = new PublicKey(referenceField);

    const memoParam = request.query.memo;
    if (memoParam && typeof memoParam !== 'string') throw new Error('invalid memo');
    const memo = memoParam || undefined;

    const messageParam = request.query.message;
    if (messageParam && typeof messageParam !== 'string') throw new Error('invalid message');
    const message = messageParam || undefined;

    // Account provided in the transaction request body by the wallet.
    const accountField = request.body?.account;
    if (!accountField) throw new Error('missing account');
    if (typeof accountField !== 'string') throw new Error('invalid account');
    const account = new PublicKey(accountField);

    // Compose a simple transfer transaction to return. In practice, this can be any transaction, and may be signed.
    const transaction = await createTransfer(connection, account, {
        recipient,
        amount,
        splToken,
        reference,
        memo,
    });

    // Serialize and return the unsigned transaction.
    const serialized = transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
    });
    const base64 = serialized.toString('base64');

    response.status(200).send({ transaction: base64, message });
}

const index: NextApiHandler<GetResponse | PostResponse> = async (request, response) => {
    await cors(request, response);
    await rateLimit(request, response);

    if (request.method === "GET") {
        await get(request, response);
        return;
    }

    if (request.method === "POST") {
        await post(request, response);
        return;
    }

    throw new Error(`Unexpected method ${request.method}`);
};

export default index;
