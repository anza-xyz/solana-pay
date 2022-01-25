---
title: Specification
---

## Summary

A standard URI schema to encode Solana transaction requests and manage their lifecycle to enable payment use cases. Rough consensus on this spec has been reached, and WIP implementations exist in Phantom, FTX, and Slope.

This standard draws inspiration from [BIP 21](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) and [EIP 681](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-681.md).

## Motivation

A standard URI scheme across wallets for native SOL and SPL Token payments (transfers) allows for a better user experience across wallets and apps in the Solana ecosystem.

Applications looking to accept payments also must ensure that a transaction has been confirmed and has the expected amount before they can release the goods or services being sold. By standardizing an approach to solving those problems we ensure application and wallet developers only have to adhere to one standard rather than each wallet defining it's own.

## Specification

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
