# Solana Pay

`@solana/pay` provides a JavaScript library for facilitating commerce on Solana by using a token transfer URL scheme. The URL scheme ensures that no matter the wallet or service used, the payment request must be created and interpreted in one standard way. 

<details>
    <summary>Token transfer URL scheme</summary>
    
# SolanaPay Specification Draft

This is a draft specification of the SolanaPay URL protocol.

## v0.1 Base Protocol

This is the original proposal, compiled and adapted from discussion on https://github.com/solana-labs/solana/issues/19535.

Rough consensus on this spec has been reached, and WIP implementations exist in Phantom, FTX, and Slope.

---

A standard URL scheme across wallets for native SOL and SPL Token payments (transfers) is desirable.  This scheme for example could be encoded as a QR Code.

TrustWallet has taken the lead with `solana:<ADDRESS>?amount=<AMOUNT>`, which is essentially [BIP 21](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) but with the `bitcoin:` scheme replaced with `solana:`.  This is a great start.

The existing BIP 21 `label=string` ("Label for that address (e.g. name of receiver)") and `message=string` ("message that describes the transaction to the user ") fields are directly relevant. This labels are informative only and are not encoded into the on-chain transaction

The `amount` field is always interpreted to be a decimal number of "user" units. For SOL, that's SOL and not lamports.  For tokens,`uiAmountString` and not `amount` (reference: [Token Balances Structure](https://docs.solana.com/developing/clients/jsonrpc-api#token-balances-structure)).  If the provided decimal fractions exceed what's supported for SOL (9) or the token (mint specific), the URL must be considered malformed URL and rejected. Scientific notation is prohibited. If the amount is not provided, the wallet should prompt the user for the amount.

For SPL Token transfers, an additional `spl-token=<MINT_ADDRESS>`, is required to define the token type.  If no `spl-token=` field is specified, the URL describes a native SOL transfer. For SPL Token transfers, the [Associated Token Account](https://spl.solana.com/associated-token-account) convention must be used.  Transfers to auxiliary token accounts are not supported.

A `memo=string` field is also permitted, where the provided string should be encoded as an [SPL Memo](https://spl.solana.com/memo) instruction in the payment transaction.  It's recommended that the memo field be displayed to the user before they authorize the transaction.  The SPL Memo instruction MUST be included immediately ~~after~~ BEFORE the SOL or SPL Token transfer instruction; this placement is essential to avoid ambiguity when multiple transfers are batched together in a single transaction.

The sender may optionally choose to use a confidential token transfer if the receiving address has configured a confidential token account.

#### Examples
URL describing a transfer for 1 SOL:
```
solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId1234
```

URL describing a transfer for $0.01 SPL USDC
```
solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678
```

URL describing a generic SOL transfer with a recipient name and memo. The user should be prompted for the exact amount while authorizing the transfer:
```
solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN&label=Michael&memo=4321ABCD
```

## v0.2 Reference Addresses

This is the proposal to add a `reference` parameter to the payment URL.

Rough consensus on this spec has been reached, and WIP implementations exist in Phantom, FTX, and Slope.

All functionality from v0.1 is preserved.

We propose adding an optional `reference=<REFERENCE_ADDRESS>` parameter. If provided, a unique account address should be generated and included as a value. 

If `reference` parameters are included, the wallet should attach them as read-only, non-signer keys to the `SystemProgram.transfer` or `TokenProgram.transfer` instruction.

This allows any transaction using the `reference` address to be located on chain with the [`getSignaturesForAddress`](https://docs.solana.com/developing/clients/jsonrpc-api#getsignaturesforaddress) RPC method.

Multiple `reference` parameters should be supported if the requester wishes to categorize transactions on chain.

## v0.3 Request Link

This is a new proposal. No consensus or implementation exists.

This proposal draws in part from https://en.bitcoin.it/wiki/BIP_0072, relying on HTTPS for transmitting and authenticating arbitrary transaction payloads. 

There are a some significant shortcomings of the simple BIP21-based payment link scheme described above.

#### 1. It only describes simple native SOL and SPL token transfers.

Merchants, service providers, and apps may wish to mint NFTs or transfer reward tokens with purchases, invoke programs, pay gas for customer transactions, and enable many other use cases that may be developed with arbitrary transactions.

Transactions on Solana must specify the accounts that will be included in the transaction upfront. Most useful instructions require the wallet signer address, their auxiliary token account address, etc.

This requires knowing the wallet address and being able to generate PDAs from it, which cannot be known when the link is created. In short, it's missing a "connect wallet" function.

#### 2. Payment requests are not authenticated.

We may expect that payment links will be maliciously or accidentally misused. Without knowing who a receiving address belongs to, it's not possible to determine from the URL who is requesting the payment.

A mechanism such as an HTTPS link allows the wallet to authenticate the source of the request. There may be other mechanisms we should consider. 

---

This proposal is to add an optional `request=<URL_ENCODED_URL>` parameter included in the link.

An interactive protocol between the merchant and wallet follows:

1. The merchant presents a QR code with the following payment link:
```
solana:<ADDRESS>?request=https%3A%2F%2Fmerchant.com%2Fsolanapay
```
Any of the parameters of the spec can also be included. `<ADDRESS>` could be considered optional. Perhaps an invalid address (e.g. `a`, `x`, or `_`) could be provided for compatibility. Regardless, it should not be used by the wallet if `request` is provided.

2. The customer scans the QR code and opens their wallet app.

3. The wallet parses link and prompts the user to make a request to `https://merchant.com/solanapay`.

This is analogous to connecting a wallet to a dapp, so obtaining the user's permission is important for privacy.

6. If permitted, the wallet makes a request to
```
https://merchant.com/solanapay?from=<WALLET_ADDRESS>&<...PARAMs>
```
The wallet should include any parameters from the URL provided, except for the `request` parameter.

5. The merchant responds with a JSON object:
```
{"transaction":"<TRANSACTION>"}
```
The `transaction` field must be a base58-encoded [serialized transaction](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#serialize).

The `feePayer`, `recentBlockhash`, `nonceInfo`, and `signatures` fields are optional but may be included. If they are included, the wallet must use them in the final transaction, since the transaction may be partially signed and subsidized by the merchant.

The wallet should allow additional fields in the JSON object, which may be added by future specifications.

6. The wallet deserializes the transaction, simulates it, and presents it for signing.

The wallet may wish to display the domain the request came from, and may wish to show payment requests not including a `request` parameter as unauthenticated. 

8. The user signs the transaction and the wallet sends and confirms it.

9. The merchant discovers the transaction through the `reference` parameter, if provided.
    
</details>

## Why use Solana Pay

Businesses and developers can use Solana Pay to accept payments in SOL or any SPL token without intermediaries. It offers  frictionless and portable integration options like payment links, pay now buttons or QR codes on your app, dApp, website, blog, and so much more. 

## How it works

**Web app to mobile wallet**
    
![](https://i.imgur.com/zagGsM3.png)

Payment requests can be encoded as a URL according to the scheme, scanned using a QR code, sent and confirmed by the wallet, and discovered by the app.

**Web app to browser wallet**
    
![](https://i.imgur.com/MXxGMeZ.png)

With a Solana Pay button, you could integrate an embeddable payment button that can be added to your existing app.

**Mobile app to mobile wallet** 
    
![](https://i.imgur.com/GKCWbKG.png)

Payment requests could be encoded as a deep link. The app prepares a payment request, and passes control to the wallet. The wallet signs, sends, and confirms it, or cancels the request and passes control back to the app.

## Getting Started

Learn how to integrate Solana Pay in your website, application or wallet.

### Merchant Integration

This section describes how a merchant can integrate Solana Pay into their payments flow. It shows how to create a payment request link, encode it into a QR code, find the transaction, and validate it.

This guide walks through an example of a QR code-based Point of Sale system that accepts payments via Solana Pay.

The complete example code can be found [here][5].

#### Requirements

- Before you can receive payments, you'll need to obtain a native SOL address. This doesn't cost anything, and you can use [Phantom](https://phantom.app/) or [FTX.us](https://ftx.us/) to get set up.

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

##### 1.1 Establish a connection

When working on Solana, you will need to connect to the network. For our example, we will connect to `devnet`.
    
<details open>
    <summary>
        Establish a connection to the <code>devnet</code> network
    </summary>
    
<br>
    
```typescript=
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
    
```typescript=
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
    
See [full code snippet][7]
</details>

<br>

The `recipient` must be a native SOL address. So, for our merchant example, the recipient is the merchant's native SOL wallet address.

The parsed `amount` is always interpreted to be a decimal number of "user" units. For SOL, that's SOL and not lamports. If the provided decimal fractions exceed nine for SOL or the token specific mint decimal, the URL must be considered a malformed URL and rejected. The wallet should prompt the user if the parsed URL does not contain an amount.

The `label` and `message` are only for display by the wallets and are not encoded into the on-chain transaction. `label` could be the merchant name or the brand, and you could use the `message` to describe the purchase to the user.

The `memo` can be used to record a message on chain with the transaction.

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
    
See [full code snippet][7]
</details>

#### 3. Encode link into a QR code

Now that you've created a payment link, you need a way to show it to your customers.

<details>
    <summary>
        Encode the link into a QR code.
    </summary>
    
```typescript=
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
    
See [full code snippet][7]
</details>

<br>


![](https://i.imgur.com/pa0mQBz.png)

##### 3.1 Add the QR code to your payment page

The QR code needs to be visible on your payment page.
    
<details>
    <summary>
        Add the QR code to an element on the payment page
    </summary>    

```typescript=
    // -- snippet -- //
    
    console.log('3. 💰 Create a payment request link \n');
    const url = encodeURL({ recipient: MERCHANT_WALLET, amount, reference, label, message, memo });
    
    // encode URL in QR code
    const qrCode = createQR(url);
    
    // get a handle of the element
    const element = document.getElementById("qr-code");
    
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
    
```typescript=
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
    
```typescript=
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
    
```typescript=
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
    
See [full code snippet][7]
</details>

#### Best practices

We recommend handling a customer session in a secure environment. Building a secure integration with Solana Pay requires a payment flow as follows:
    
![](https://i.imgur.com/xL9mdrY.png)

1. Customer goes to the payment page
2. Merchant frontend (client) sends order information to the backend
3. Merchant backend (server)  generates a reference public key and stores it in a database with the expected amount for the shopping cart / pending purchase (unique to each customer's checkout session).
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
const url = "solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678";
const { recipient, amount, splToken, reference, label, message, memo } = parseURL(url);
```
    
See [full code snippet][7]
</details>

<br>

The `recipient` is a native SOL address and the payee.

The parsed `amount` is always interpreted to be a decimal number of "user" units. For SOL, that's SOL and not lamports. If the provided decimal fractions exceed nine for SOL or the token specific mint decimal, the URL must be considered a malformed URL and rejected. If there is no `amount`, you **must** prompt the user to enter an amount.

Potential use cases where the amount could be empty:

- accepting donations
- accepting tips

The `label` and `message` are only for display and are not encoded into the on-chain transaction.

The `memo` can be used to record a message on chain with the transaction.

The `reference` allow for the transaction to be located on-chain. For this, you should use a random, unique public key. You can think of this as a unique ID for the payment request that the Solana Pay protocol uses to locate the transaction. 

The `spl-token` parameter is optional. If empty, it symbolises this transfer is for native SOL. Otherwise, it's the SPL token mint address. The provided decimal fractions in the `amount` must not exceed the decimal count for this mint. Otherwise, the URL must be considered malformed.

#### 3. Create transaction

Use the `createTransaction` function to create a transaction with the parameters from the `parseURL` function with an additional `payer`.

The `payer` **should** be the public key of the current users' wallet.

<details>
    <summary>Create transaction reference implementation</summary>
    
<br>
    
```typescript
import { parseURL, createTransaction } from '@solana/pay';

const url = "solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678";
const { recipient, amount, splToken, reference, label, message, memo } = parseURL(url);

/**
* Create the transaction with the paramaters decoded from the URL
*/
const payer = CUSTOMER_WALLET.publicKey;
const tx = await createTransaction(connection, payer, recipient, amount as BigNumber, {
    reference,
    memo,
});
```
    
See [full code snippet][7]
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
    
```typescript=
const { recipient, message, memo, amount, reference, label } = parseURL(url);
console.log('label: ', label);
console.log('message: ', message);

/**
* Create the transaction with the paramaters decoded from the URL
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
    
See [full code snippet][7]
</details>

<!--
## Usage

The SDK provides helper utilities for integrations with dApps and wallet providers.

For more detailed documentation, checkout our [example](#getting-started) above.

### Creating a payment request URL

```ts=
const recipient = new Keypair().publicKey;
const amount = new BigNumber(20);
const reference1 = new Keypair().publicKey;
const reference2 = new Keypair().publicKey;

const reference = [reference1, reference2];
const label = 'Jungle Cats store';
const message = 'Jungle Cats store - your order - #001234';
const memo = 'JC#4098';

const url = encodeURL(recipient, {
    amount,
    label,
    message,
    memo,
    reference
});
console.log(url); // solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=9.5
```

| Params       |  Type    | Required/Default                      | Description                                                                                                                                                                                                                                         |
| ------------ | --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recipient`  |   `PublicKey`  | **`true`**      | The address the payment should be made to. It **must** be a native SOL address.                                                                                                                                                                                                          |
| `amount`     |  `BigNumber`   |                | The amount of SOL or SPL token that should be transferred. It  is always interpreted to be a decimal number of "user" units. If `null` the user will be requested to enter an amount by the wallet provider                                                                                                           |
| `spl-token`      |   `PublicKey`  |                 | The mint address of the SPL token. If `null` the transaction will be for native SOL                                                                                                                                                                 |
| `reference` |  `PublicKey \| PublicKey[]`   |  | An array of public keys used to identify this transaction. They are the **only** way you'll be able to ensure that the customer has completed this transaction and payment is complete.  |
| `label`      |  `string`   |                    | *Label to be shown; should be the merchant name |
| `message`    |   `string`  |                    | *Message to be shown; should describe the transaction to the user |
| `memo`       |   `string`  |                    | Creates an additional transaction for the [Memo Program][2] |

> \* It's to the discression of the wallet provider to implement

### Creating a QR code

```ts
import { createQR } from '@solana/pay'

const recipient = new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'); // addess the payment should be made to
const url = encodeURL(recipient);
const qr = createQR(url);
```

| Params       |  Type   | Required/Default        | Description                       |
| ------------ | --- | ------------------------- | --------------------------------- |
| `data`       |  `string`   | **`required`**  | The URL to encode in the QR code. |
| `size`       |  `number`   | `512`            | Size of canvas in `px`            |
| `background` |  `string`   | `white`          | Background color for QR code      |
| `color`      |  `string`   | `black`          | Color for QR code pattern         |

> 👆🏽The QR code needs to be visible on your payment page. Instructions on how to place this on your payment page can be found [here](https://github.com/kozakdenys/qr-code-styling) for your framework of choice.

### Finding the transaction

```ts
import { findTransactionSignature } from '@solana/pay'
import { clusterApiUrl, Connection } from '@solana/web3.js';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const reference1 = new PublicKey('FWZedVtyKQtP4CXhT7XDnLidRADrJknmZGA2qNjpTPg8')
    const signatureInfo = await findTransactionSignature(connection, reference1); // `reference1` is our reference public key that we used when creating the payment link
    console.log('signature: ', signatureInfo.signature)
})
```

| Params       |   Type  | Required/Default                         | Description                                                                                            |
| ------------ | --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `connection` |   `Connection`  | **`required`**        | A connection to a fullnode JSON RPC endpoint.                                                          |
| `reference`  |  `PublicKey`   | **`required`**          | A `PublicKey` that was included as a reference in the transaction                                      |
| `options`    |  `SignaturesForAddressOptions`   |  | Options for `getSignaturesForAddress`                                                                  |
| `finality`   |  `Finality`   |                   | A subset of Commitment levels, which are at least optimistically confirmed; `confirmed` or `finalized` |

### Validating the transaction

```ts=
// 🚨 CODE SNIPPET TO BE UPDATED

import { validateTransactionSignature, findTransactionSignature } from '@solana/pay';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const reference1 = new PublicKey('FWZedVtyKQtP4CXhT7XDnLidRADrJknmZGA2qNjpTPg8');
    const signatureInfo = await findTransactionSignature(connection, reference1);
    const recipient = new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN');
    const amount = new BigNumber(9.5);

    const ref = await validateTransactionSignature(connection, signature, recipient, amount);
})
```

| Params       | Type                            |  Required/Default   | Description                                                                                            |
| ------------ | --------------------------------------- | --- | ------------------------------------------------------------------------------------------------------ |
| `connection` | `Connection`           |  **`required`**    | A connection to a fullnode JSON RPC endpoint.                                                          |
| `signature`  | `TransactionSignature` |  **`required`**    | The signature to validate                                                                              |
| `recipient`  | `PublicKey`            |   **`required`**   | The address the payment was made to.                                                                   |
| `amount`     | `BigNumber`                      |     | The amount of SOL or SPL token that was transferred.                                                   |
| `spl-token`      | `PublicKey`                      |     | If the transfer was for a SPL token, this is the mint address of the SPL token.                        |
| `reference` | `PublicKey \| PublicKey[]`    |     | A `PublicKey` that was included as a reference in the transaction. Must include all the references that were used.                                      |
| `finality`   | `Finality`                      |     | A subset of Commitment levels, which are at least optimistically confirmed; `confirmed` or `finalised` |

### Parsing a payment request URL

```ts
import { parseURL } from '@solana/pay';

const url = "solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678"; // 🚨 for example only
const { recipient, amount, splToken, reference, label, message, memo } = parseURL(url);
``` 

| Params | Type              |  Required/Default   | Description             |
| ------ | ------------------------- | --- | ----------------------- |
| `url`  | `string` |  **`required`**   | The payment request url |

### Create a transaction from the URL

```ts
import { createTransaction, parseURL } from '@solana/pay';
import { Keypair, Connection } from '@solana/web3.js';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const url = "solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678"; // 🚨 for example only

    const { recipient, amount, splToken, reference, label, message, memo } = parseURL(url);

    const payer = new Keypair.generate().publicKey // 🚨 for example only; who is paying for the transaction

    const transaction = await createTransaction(connection, payer, recipient, amount, {
        reference,
        memo
    });
})
```

| Params       | Type                            |  Required/Default   | Description                                                                                            |
| ------------ | --------------------------------------- | --- | ------------------------------------------------------------------------------------------------------ |
| `connection` | `Connection`           |  **`required`**    | A connection to a fullnode JSON RPC endpoint.                                                          |
| `payer`  | `PublicKey` |  **`required`**    | `PublicKey` of the payer                                  |
| `recipient`  | `PublicKey`            |   **`required`**   | The **native SOL** address the payment should be made to.                                                                   |
| `amount`     | `BigNumber`                      |     | The amount of SOL or SPL token that was transferred.                                                   |
| `spl-token`      | `PublicKey`                      |     | If the transfer was for a SPL token, this is the mint address of the SPL token.                        |
| `reference` | `PublicKey \| PublicKey[]`    |     | A `PublicKey` that was included as a reference in the transaction                                      |
| `memo`       |   `string`  |                    | Creates an additional transaction for the [Memo Program][2]   |
-->

## License

The Solana Pay JavaScript SDK is open source and available under the Apache License, Version 2.0. See the [LICENSE]() file for more info.

<!-- References -->
[1]: https://github.com/kozakdenys/qr-code-styling
[2]: https://spl.solana.com/memo
[3]: https://github.com/solana-labs/solana/issues/19535
[4]: https://github.com/solana-labs/solana-pay/tree/master/point-of-sale
[5]: https://github.com/solana-labs/solana-pay/tree/master/js/example/payment-flow-merchant
[7]: https:google.com
