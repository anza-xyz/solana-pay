# Solana Pay Specification

## Summary
A standard protocol to encode Solana transaction requests within URLs to enable payments and other use cases.

Rough consensus on this spec has been reached, and implementations exist in Phantom, FTX, and Slope.

This standard draws inspiration from [BIP 21](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) and [EIP 681](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-681.md).

## Motivation
A standard URL protocol for requesting native SOL and SPL Token transfers allows for a better user experience across wallets and apps in the Solana ecosystem.

Applications should ensure that a payment transaction has been confirmed and contains a transfer of the expected amount and type before they release the goods or services being sold.

Mobile wallets should ideally register to handle the URL scheme and provide a seamless yet secure experience when Solana Pay URLs are encountered in the environment.

By standardizing a simple approach to solving those problems, we ensure compatibility of applications and wallets.

## Specification
```
https://some-solana-wallet.com/?recipient=<recipient>&amount=<amount>&label=<label>&message=<message>&memo=<memo>&reference=<reference>&request=<request>
```
or
```
solana:<recipient>?amount=<amount>&label=<label>&message=<message>&memo=<memo>&reference=<reference>&request=<request>
```

### Recipient
A single `recipient` field is required as a query param, or in cases where the `solana:` protocol is used, as a pathname. The value must be the base58-encoded public key of a native SOL account. Associated token accounts must not be used.

Instead, to request an SPL token transfer, the `spl-token` field must be used to specify an SPL Token mint, from which the associated token address of the recipient address must be derived.

### Amount
A single `amount` field is allowed as an optional query parameter. The value must be a non-negative integer or decimal number of "user" units. For SOL, that's SOL and not lamports. For tokens, `uiAmountString` and not `amount` (reference: [Token Balances Structure](https://docs.solana.com/developing/clients/jsonrpc-api#token-balances-structure)).

`0` is a valid value. If the value is a decimal number less than `1`, it must have a leading `0` before the `.`. Scientific notation is prohibited.

If a value is not provided, the wallet must prompt the user for the amount. If the number of decimal places exceed what's supported for SOL (9) or the SPL token (mint specific), the wallet must reject the URL as malformed.

### SPL Token
A single `spl-token` field is allowed as an optional query parameter. The value must be the base58-encoded public key of an SPL Token mint account.

If the field is not provided, the URL describes a native SOL transfer. If the field is provided, the [Associated Token Account](https://spl.solana.com/associated-token-account) convention must be used.

Wallets must derive the ATA address from the `recipient` and `spl-token` fields. Transfers to auxiliary token accounts are not supported.

### Reference
Multiple `reference` fields are allowed as optional query parameters. The values must be base58-encoded public keys.

If the values are provided, wallets must attach them in the order provided as read-only, non-signer keys to the `SystemProgram.transfer` or `TokenProgram.transfer`/`TokenProgram.transferChecked` instruction in the payment transaction. The values may or may not be unique to the payment request, and may or may not correspond to an account on Solana.

Because Solana validators index transactions by these public keys, `reference` values can be used as client IDs (IDs usable before knowing the eventual payment transaction). The [`getSignaturesForAddress`](https://docs.solana.com/developing/clients/jsonrpc-api#getsignaturesforaddress) RPC method can be used locate transactions this way.

### Label
A single `label` field is allowed as an optional query parameter. The value must be a URL-encoded string that describes the source of the payment request.

For example, this might be the name of a merchant, a store, an application, or a user making the request. Wallets should display the label to the user.

### Message
A single `message` field is allowed as an optional query parameter. The value must be a URL-encoded string that describes the nature of the payment request.

For example, this might be the name of an item being purchased. Wallets should display the message to the user.

### Memo
A single `memo` field is allowed as an optional query parameter. The value must be a URL-encoded string that will be included in an [SPL Memo](https://spl.solana.com/memo) instruction in the payment transaction.

Wallets should display the memo to the user. The SPL Memo instruction must be included immediately before the SOL or SPL Token transfer instruction to avoid ambiguity with other instructions in the transaction.

### Request
A single `request` field is allowed as an optional query parameter. The value must be a URL-encoded string that describes the URL of the merchant's authentication server for the transaction.

How wallets and merchants should handle authentication with `request` will be outlined in [Wallet Integration](./docs/src/core/WALLET_INTEGRATION.md) and [Merchant Integration](./docs/src/core/MERCHANT_INTEGRATION.md) respectively.

## Examples
URL describing a transfer for 1 SOL:
```
https://some-solana-wallet.com/?recipient=mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId1234
```

URL describing a transfer for 1 SOL with no wallet disambiguation:
```
solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId1234
```

URL describing a transfer for 0.01 USDC
```
https://some-solana-wallet.com/?recipient=mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678
```

URL describing a generic SOL transfer. The user must be prompted for the exact amount.
```
https://some-solana-wallet.com/?recipient=mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?label=Michael&memo=4321ABCD
```

## Extensions

Additional fields may be incorporated into this specification to enable new use cases while ensuring compatibility with apps and wallets.

Please open a Github issue to propose changes to the specification and solicit feedback from application and wallet developers.

[An actual example of such a proposal.](https://github.com/solana-labs/solana-pay/issues/26)
