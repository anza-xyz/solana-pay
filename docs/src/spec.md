---
title: Solana Pay Specification
---

## Summary
A standard URI schema to encode Solana transaction requests and manage their lifecycle to enable payment use cases. Rough consensus on this spec has been reached, and WIP implementations exist in Phantom, FTX, and Slope.

This standard draws inspiration from [BIP 21](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) and [EIP 681](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-681.md).

## Motivation
A standard URI scheme across wallets for native SOL and SPL Token payments (transfers) allows for a better user experience across wallets and apps in the Solana ecosystem.

Applications looking to accept payments also must ensure that a transaction has been confirmed and has the expected amount before they can release the goods or services being sold. By standardizing an approach to solving those problems we ensure application and wallet developers only have to adhere to one standard rather than each wallet defining it's own.

## Specification v0.2

### Syntax
```
amount                  = Amount user must pay
memo                    = Displayed to the user before authorization
spl-token               = Optional mint address of expected token
label                   = Name of receiver
message                 = Description of transaction for the user
reference               = Unique account address to identify the transaction
```
#### Amount
The `amount` field is always interpreted to be a decimal number of "user" units. For SOL, that's SOL and not lamports. For tokens, `uiAmountString` and not `amount` (reference: [Token Balances Structure](https://docs.solana.com/developing/clients/jsonrpc-api#token-balances-structure)). If the provided decimal fractions exceed what's supported for SOL (9) or the token (mint specific), the URL must be considered malformed URL and rejected. Scientific notation is prohibited. If the amount is not provided, the wallet should prompt the user for the amount.

#### Memo
A memo=string field is also permitted, where the provided string should be encoded as an [SPL Memo](https://spl.solana.com/memo) instruction in the payment transaction. It's recommended that the memo field be displayed to the user before they authorize the transaction. The SPL Memo instruction MUST be included immediately BEFORE the SOL or SPL Token transfer instruction; this placement is essential to avoid ambiguity when multiple transfers are batched together in a single transaction.

#### SPL Token
For SPL Token transfers, an additional spl-token=<MINT_ADDRESS>, is required to define the token type. If no spl-token= field is specified, the URL describes a native SOL transfer. For SPL Token transfers, the [Associated Token Account](https://spl.solana.com/associated-token-account) convention must be used. Transfers to auxiliary token accounts are not supported.

#### Reference
If `reference` is provided, a unique account address should be generated and included as a value. 

If `reference` parameters are included, the wallet should attach them as read-only, non-signer keys to the `SystemProgram.transfer` or `TokenProgram.transfer` instruction.

This allows any transaction using the reference address to be located on chain with the `[getSignaturesForAddress](https://docs.solana.com/developing/clients/jsonrpc-api#getsignaturesforaddress)` RPC method.

Multiple `reference` parameters should be supported if the requester wishes to categorize transactions on chain.


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

### Supported Wallets

* Phantom
* FTX
* Slope

## Specification v0.3

### Summary
Include an optional `request` parameter that allows developers to construct a transaction on their server and provide it to the wallet. This allows for more complex use cases such as rewarding the user with NFTs or tokens, paying gas for customer transactions, and many other uses cases.


### Syntax
```
request                 = URL to fetch a transaction to be signed by the user
```

### Details

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
