# Solana Pay

`@solana/pay` is a JavaScript library for facilitating commerce on Solana by using a token transfer URL scheme. The URL scheme ensures that no matter the wallet or service used, the payment request must be created and interpreted in one standard way.

[Read the draft specification.](SPEC.md)

## Why use Solana Pay

Businesses and developers can use Solana Pay to accept payments in SOL or any SPL token without intermediaries. It offers frictionless and portable integration options like payment links, pay now buttons or QR codes on your app, dApp, website, blog, and so much more.

## How it works

### Web app to mobile wallet

![web app to mobile wallet diagram](./qr-code-flow.png)

Payment requests can be encoded as a URL according to the scheme, scanned using a QR code, sent and confirmed by the wallet, and discovered by the app.

### Web app to browser wallet

![web app to browser wallet diagram](./dapp-web-wallet-flow.png)

With a Solana Pay button, you could integrate an embeddable payment button that can be added to your existing app.

### Mobile app to mobile wallet

![mobile app to mobile wallet diagram](./mobile-app-mobile-wallet-flow.png)

Payment requests could be encoded as a deep link. The app prepares a payment request, and passes control to the wallet. The wallet signs, sends, and confirms it, or cancels the request and passes control back to the app.

## Getting Started

Learn how to integrate Solana Pay in your website, application or wallet.

### Merchant Integration

This section describes how a merchant can integrate Solana Pay into their payments flow. It shows how to create a payment request link, encode it into a QR code, find the transaction, and validate it.

This guide walks through an example of a QR code-based Point of Sale system that accepts payments via Solana Pay.

The complete example code can be found [here][5].

#### Requirements

Before you can receive payments, you'll need to obtain a native SOL address. This doesn't cost anything, and you can use any wallet to get started.

If you want to receive USDC or another SPL token on Solana, you'll need to create a token account, which may require a small amount of SOL.

One way to do both is to use FTX / FTX.us, which will provide a native SOL deposit address and an associated USDC token account to receive payments.

---

#### 1. Set up Solana Pay

Install the packages and import them in your code.

**npm**

```shell
npm install @solana/pay @solana/web3.js --save
```

**yarn**

```shell
yarn add @solana/pay @solana/web3.js
```

##### 1.1 Establish a connection

When working on Solana, you will need to connect to the network. For our example, we will connect to `devnet`.

<details open>
    <summary>
        Establish a connection to the <code>devnet</code> network
    </summary>

<br>

```typescript
import { Cluster, clusterApiUrl, Connection } from '@solana/web3.js';

async function main() {
    // Variable to keep state of the payment status
    let paymentStatus: string;

    // Connecting to devnet for this example
    console.log('1. ✅ Establish connection to the network');
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
}
```

</details>

#### 2. Create a payment request link

Solana pay uses a standard URL scheme across wallets for native SOL and SPL Token payments. Several parameters are encoded within the link representing an intent to collect payment from a customer.

<details>
    <summary>
        Create a payment request link with a <code>recipient</code>, <code>amount</code>, <code>label</code>, <code>message</code> ,  <code>memo</code> and <code>reference</code>.
    </summary>

<br>

```typescript
// -- snippet -- //

/**
 * Simulate a checkout experience
 *
 * Recommendation:
 * `amount` and `reference` should be created in a trusted environment (server).
 * The `reference` should be unique to a single customer session,
 * and will be used to find and validate the payment in the future.
 *
 */
console.log('2. 🛍 Simulate a customer checkout \n');
const amount = new BigNumber(20);
const reference = new Keypair().publicKey;
const label = 'Jungle Cats store';
const message = 'Jungle Cats store - your order - #001234';
const memo = 'JC#4098';

/**
 * Create a payment request link
 *
 * Solana pay uses a standard URL scheme across wallets for native SOL and SPL Token payments.
 * Several parameters are encoded within the link representing an intent to collect payment from a customer.
 */
console.log('3. 💰 Create a payment request link \n');
const url = encodeURL({ recipient: MERCHANT_WALLET, amount, reference, label, message, memo });
```

See [full code snippet][6]

</details>

<br>

The `recipient` must be a native SOL address. So, for our merchant example, the recipient is the merchant's native SOL wallet address.

The parsed `amount` is always interpreted to be a decimal number of "user" units. For SOL, that's SOL and not lamports. If the provided decimal fractions exceed nine for SOL or the token specific mint decimal, the URL must be considered a malformed URL and rejected. The wallet should prompt the user if the parsed URL does not contain an amount.

The `label` and `message` are only for display by the wallets and are not encoded into the on-chain transaction. `label` could be the merchant name or the brand, and you could use the `message` to describe the purchase to the user.

The `memo` can be used to record a message on-chain with the transaction.

The `reference` allows for the transaction to be located on-chain. For this, you should use a random, unique public key. You can think of this as a unique ID for the payment request that the Solana Pay protocol uses to locate the transaction.

##### Optional. SPL token transfer

For SPL Token transfers, use the `spl-token` parameter. The `spl-token` is the mint address of the SPL token.

<details>
    <summary>See code snippet</summary>

```diff
    // -- snippet -- //

     /**
     * Simulate a checkout experience
     *
     * Recommendation:
     * `amount` and `reference` should be created in a trusted environment (server).
     * The `reference` should be unique to a single customer session,
     * and will be used to find and validate the payment in the future.
     *
     */
    console.log('2. 🛍 Simulate a customer checkout \n');
    const amount = new BigNumber(20);
    const reference = new Keypair().publicKey;
    const label = 'Jungle Cats store';
    const message = 'Jungle Cats store - your order - #001234';
    const memo = 'JC#4098';
+   const splToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    /**
     * Create a payment request link
     *
     * Solana pay uses a standard URL scheme across wallets for native SOL and SPL Token payments.
     * Several parameters are encoded within the link representing an intent to collect payment from a customer.
     */
    console.log('3. 💰 Create a payment request link \n');
-   const url = encodeURL({ recipient: MERCHANT_WALLET, amount, reference, label, message, memo });
+   const url = encodeURL({ recipient: MERCHANT_WALLET, amount, reference, label, message, memo, splToken });
```

</details>

#### 3. Encode link into a QR code

Now that you've created a payment link, you need a way to show it to your customers.

<details>
    <summary>
        Encode the link into a QR code.
    </summary>

```typescript
// -- snippet -- //

/**
 * Create a payment request link
 *
 * Solana pay uses a standard URL scheme across wallets for native SOL and SPL Token payments.
 * Several parameters are encoded within the link representing an intent to collect payment from a customer.
 */
console.log('3. 💰 Create a payment request link \n');
const url = encodeURL({ recipient: MERCHANT_WALLET, amount, reference, label, message, memo });

// encode URL in QR code
const qrCode = createQR(url);
```

</details>

<br>

![qr code](../solana-pay.png)

##### 3.1 Add the QR code to your payment page

The QR code needs to be visible on your payment page.

<details>
    <summary>
        Add the QR code to an element on the payment page
    </summary>

```typescript
// -- snippet -- //

console.log('3. 💰 Create a payment request link \n');
const url = encodeURL({ recipient: MERCHANT_WALLET, amount, reference, label, message, memo });

// encode URL in QR code
const qrCode = createQR(url);

// get a handle of the element
const element = document.getElementById('qr-code');

// append QR code to the element
qrCode.append(element);
```

</details>
<br>

Instructions on integrating with your framework of choice can be found [here][1].

#### 4. Show a payment status page

With the payment link set up and shown to the customer, you will need to ensure that the customer has paid for the item before shipping their order.

When a customer approves the payment request in their wallet, this transaction exists on-chain. You can use any references encoded into the payment link to find the exact transaction on-chain.

<details>
    <summary>
        Use <code>findTransactionSignature</code> to find the on-chain transaction. Provide a <code>reference</code> to this function that identifies the transaction associated with the order.
    </summary>

<br>

```typescript
// -- snippet -- //

/**
 * Simulate wallet interaction
 *
 * This is only for example purposes. This interaction will be handled by a wallet provider
 */
console.log('4. 🔐 Simulate wallet interaction \n');
simulateWalletInteraction(connection, url);

// Update payment status
paymentStatus = 'pending';

/**
 * Wait for payment to be confirmed
 *
 * When a customer approves the payment request in their wallet, this transaction exists on-chain.
 * You can use any references encoded into the payment link to find the exact transaction on-chain.
 * Important to note that we can only find the transaction when it's **confirmed**
 */
console.log('\n5. Find the transaction');
const signatureInfo = await findTransactionSignature(connection, reference, undefined, 'confirmed');

// Update payment status
paymentStatus = 'confirmed';
```

See [full code snippet][7]

</details>

##### 4.1 Retries

If a transaction with the given reference can't be found, the `findTransactionSignature` function will throw an error. There are a few reasons why this could be:

- Transaction is not yet confirmed
- Customer is yet to approve/complete the transaction

<details>
    <summary>
        You can implement a polling strategy to query for the transaction periodically.
    </summary>

```typescript
// -- snippet -- //

let signatureInfo: ConfirmedSignatureInfo;

return new Promise((resolve, reject) => {
    /**
     * Retry until we find the transaction
     *
     * If a transaction with the given reference can't be found, the `findTransactionSignature`
     * function will throw an error. There are a few reasons why this could be a false negative:
     *
     * - Transaction is not yet confirmed
     * - Customer is yet to approve/complete the transaction
     *
     * You can implement a polling strategy to query for the transaction periodically.
     */
    const interval = setInterval(async () => {
        console.log('Checking for transaction...', count);
        try {
            signatureInfo = await findTransactionSignature(connection, reference, undefined, 'confirmed');
            console.log('\n 🖌  Signature found: ', signatureInfo.signature);
            clearInterval(interval);
            resolve(signatureInfo);
        } catch (error: any) {
            if (!(error instanceof FindTransactionSignatureError)) {
                console.error(error);
                clearInterval(interval);
                reject(error);
            }
        }
    }, 250);
});
```

See [full code snippet][7]

</details>

##### 4.2 Validating the transaction

Once the `findTransactionSignature` function returns a signature, it confirms that a transaction that references the order has been recorded on-chain. But it doesn't guarantee that a valid transfer with the expected amount and recipient happened.

<details>
    <summary>
        <code>validateTransactionSignature</code> allows you to validate that the transaction signature found matches the transaction that you expected.
    </summary>

```typescript
// -- snippet -- //

/**
 * Validate transaction
 *
 * Once the `findTransactionSignature` function returns a signature,
 * it confirms that a transaction with reference to this order has been recorded on-chain.
 *
 * `validateTransactionSignature` allows you to validate that the transaction signature
 * found matches the transaction that you expected.
 */
console.log('\n6. 🔗 Validate transaction \n');
const amountInLamports = convertToLamports(amount); // 🚨 Recommend to change this, conversion to be done in validateTransactionSignature

try {
    await validateTransactionSignature(connection, signature, MERCHANT_WALLET, amountInLamports, undefined, reference);

    // Update payment status
    paymentStatus = 'validated';
    console.log('✅ Payment validated');
    console.log('📦 Ship order to customer');
} catch (error) {
    console.error('❌ Payment failed', error);
}
```

See [full code snippet][8]

</details>

#### Best practices

We recommend handling a customer session in a secure environment. Building a secure integration with Solana Pay requires a payment flow as follows:

![best practices diagram](./security-best-practices.png)

1. Customer goes to the payment page
2. Merchant frontend (client) sends order information to the backend
3. Merchant backend (server) generates a reference public key and stores it in a database with the expected amount for the shopping cart / pending purchase (unique to each customer's checkout session).
4. Merchant backend redirects the user to the confirmation page with the generated reference public key.
5. The confirmation page redirects to the merchant with the transaction signature.
6. Merchant backend checks that the transaction is valid for the checkout session by validating the transaction with the reference and amount stored in step 3.

The steps outlined above prevents:

- A different transaction from being used to trick the merchant
- The frontend from being manipulated to show a confirmed transaction

### Wallet Integration

This section describes how a wallet provider can support payment links in their wallet. It shows how to parse the payment URL and create a transaction from it.

This guide walks through an **example** implementation for wallet providers. The purpose of this is to make it easy for wallets to implement the protocol correctly.

---

#### 1. Set up Solana Pay

Install the packages and import them in your code.

**npm**

```shell=
npm install @solana/pay @solana/web3.js --save
```

**yarn**

```shell=
yarn add @solana/pay @solana/web3.js
```

#### 2. Parse payment request link

As a wallet provider, you will have to parse the received URL to extract the parameters.

<details>
    <summary>Parse the URL to retrieve all possible fields:</summary>

<br>

```ts
import { parseURL } from '@solana/pay';

/**
 * For example only
 *
 * The URL that triggers the wallet interaction; follows the Solana Pay URL scheme
 * The parameters needed to create the correct transaction is encoded within the URL
 */
const url =
    'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';
const { recipient, amount, splToken, reference, label, message, memo } = parseURL(url);
```

See [full code snippet][9]

</details>

<br>

The `recipient` is a native SOL address and the payee.

The parsed `amount` is always interpreted to be a decimal number of "user" units. For SOL, that's SOL and not lamports. If the provided decimal fractions exceed nine for SOL or the token specific mint decimal, the URL must be considered a malformed URL and rejected. If there is no `amount`, you **must** prompt the user to enter an amount.

Potential use cases where the amount could be empty:

- accepting donations
- accepting tips

The `label` and `message` are only for display and are not encoded into the on-chain transaction.

The `memo` can be used to record a message on-chain with the transaction.

The `reference` allow for the transaction to be located on-chain. For this, you should use a random, unique public key. You can think of this as a unique ID for the payment request that the Solana Pay protocol uses to locate the transaction.

The `spl-token` parameter is optional. If empty, it symbolizes this transfer is for native SOL. Otherwise, it's the SPL token mint address. The provided decimal fractions in the `amount` must not exceed the decimal count for this mint. Otherwise, the URL must be considered malformed.

#### 3. Create transaction

Use the `createTransaction` function to create a transaction with the parameters from the `parseURL` function with an additional `payer`.

The `payer` **should** be the public key of the current users' wallet.

<details>
    <summary>Create transaction reference implementation</summary>

<br>

```typescript
import { parseURL, createTransaction } from '@solana/pay';

const url =
    'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';
const { recipient, amount, splToken, reference, label, message, memo } = parseURL(url);

/**
 * Create the transaction with the parameters decoded from the URL
 */
const payer = CUSTOMER_WALLET.publicKey;
const tx = await createTransaction(connection, payer, recipient, amount as BigNumber, {
    reference,
    memo,
});
```

See [full code snippet][10]

</details>

<br>

This transaction **should** represent the original intent of the payment request link. The example implementation walks through the steps on how to construct the transaction:

**Native SOL transfer**

1. Check that the payer and recipient accounts exist
2. Check the payer and recipient are valid native accounts
3. Check the payer has enough lamports for the transfer
4. Create an instruction to transfer native SOL
5. If references were included, add them to the instruction
6. If a memo was included, create an instruction for the memo program

**SPL token transfer**

1. Check that the payer and recipient accounts exist
2. Check the token provided is an initialized mint
3. Check the payer and recipient's Associated Token Account (ATA) exists
4. Check the payer has enough lamports for the transfer
5. Create an instruction to transfer SPL tokens
6. If references were included, add them to the instruction
7. If a memo was included, create an instruction for the memo program

#### 4. Complete transaction

With the transaction formed. The user must be prompted to approve the transaction.

The `label` and `message` **should** be shown to the user, as it gives added context to the user on the transaction.

<details>
    <summary>
        Finally, use <code>sendAndConfirmTransaction</code> to complete the transaction.
    </summary>

```typescript
const { recipient, message, memo, amount, reference, label } = parseURL(url);
console.log('label: ', label);
console.log('message: ', message);

/**
* Create the transaction with the parameters decoded from the URL
*/
const tx = await createTransaction(connection, CUSTOMER_WALLET.publicKey, recipient, amount as BigNumber, {
reference,
memo,
});

/**
* Send the transaction to the network
*/
sendAndConfirmTransaction(connection, tx, [CUSTOMER_WALLET]);
```

See [full code snippet][11]

</details>

## License

The Solana Pay JavaScript SDK is open source and available under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for more info.

<!-- References -->

[1]: https://github.com/kozakdenys/qr-code-styling
[2]: https://spl.solana.com/memo
[3]: https://github.com/solana-labs/solana/issues/19535
[4]: https://github.com/solana-labs/solana-pay/tree/master/point-of-sale
[5]: https://github.com/solana-labs/solana-pay/tree/master/core/example/payment-flow-merchant
[6]: https://github.com/solana-labs/solana-pay/blob/master/core/example/payment-flow-merchant/simulateCheckout.ts
[7]: https://github.com/solana-labs/solana-pay/blob/master/core/example/payment-flow-merchant/main.ts#L61
[8]: https://github.com/solana-labs/solana-pay/blob/master/core/example/payment-flow-merchant/main.ts#L105
[9]: https://github.com/solana-labs/solana-pay/blob/master/core/example/payment-flow-merchant/simulateWalletInteraction.ts#L13
[10]: https://github.com/solana-labs/solana-pay/blob/master/core/example/payment-flow-merchant/simulateWalletInteraction.ts#L27
[11]: https://github.com/solana-labs/solana-pay/blob/master/core/example/payment-flow-merchant/simulateWalletInteraction.ts#L35
