# Solana Pay Specification

## Summary
A standard protocol to encode Solana transaction and message-signing requests within URLs to enable payments, authentication, and other use cases.

Rough consensus on this spec has been reached, and implementations exist in Phantom, FTX, and Slope.

This standard draws inspiration from [BIP 21](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) and [EIP 681](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-681.md).

## Motivation
A standard URL protocol for requesting native SOL transfers, SPL Token transfers, Solana transactions, and message signing allows for a better user experience across apps and wallets in the Solana ecosystem.

These URLs may be encoded in QR codes or NFC tags, or sent between users and applications to request payment, compose transactions, and sign messages.

Applications should ensure that a transaction has been confirmed, or that a signed message is valid, before they release goods or services being sold, or grant access to objects or events.

Mobile wallets should register to handle the URL scheme to provide a seamless yet secure experience when Solana Pay URLs are encountered in the environment.

By standardizing a simple approach to solving these problems, we ensure basic compatibility of applications and wallets so developers can focus on higher level abstractions.

## Specification: Transfer Request

A Solana Pay transfer request URL describes a non-interactive request for a SOL or SPL Token transfer.
```html
solana:<recipient>
      ?amount=<amount>
      &spl-token=<spl-token>
      &reference=<reference>
      &label=<label>
      &message=<message>
      &memo=<memo>
```

The request is non-interactive because the parameters in the URL are used by a wallet to directly compose a transaction.

### Recipient
A single `recipient` field is required as the pathname. The value must be the base58-encoded public key of a native SOL account. Associated token accounts must not be used.

Instead, to request an SPL Token transfer, the `spl-token` field must be used to specify an SPL Token mint, from which the associated token address of the recipient must be derived.

### Amount
A single `amount` field is allowed as an optional query parameter. The value must be a non-negative integer or decimal number of "user" units. For SOL, that's SOL and not lamports. For tokens, use [`uiAmountString` and not `amount`](https://docs.solana.com/developing/clients/jsonrpc-api#token-balances-structure).

`0` is a valid value. If the value is a decimal number less than `1`, it must have a leading `0` before the `.`. Scientific notation is prohibited.

If a value is not provided, the wallet must prompt the user for the amount. If the number of decimal places exceed what's supported for SOL (9) or the SPL Token (mint specific), the wallet must reject the URL as **malformed**.

### SPL Token
A single `spl-token` field is allowed as an optional query parameter. The value must be the base58-encoded public key of an SPL Token mint account.

If the field is provided, the [Associated Token Account](https://spl.solana.com/associated-token-account) convention must be used, and the wallet must include a `TokenProgram.Transfer` or `TokenProgram.TransferChecked` instruction as the last instruction of the transaction.

If the field is not provided, the URL describes a native SOL transfer, and the wallet must include a `SystemProgram.Transfer` instruction as the last instruction of the transaction instead.

The wallet must derive the ATA address from the `recipient` and `spl-token` fields. Transfers to auxiliary token accounts are not supported.

### Reference
Multiple `reference` fields are allowed as optional query parameters. The values must be base58-encoded 32 byte arrays. These may or may not be public keys, on or off the curve, and may or may not correspond with accounts on Solana.

If the values are provided, the wallet must include them in the order provided as read-only, non-signer keys to the `SystemProgram.Transfer` or `TokenProgram.Transfer`/`TokenProgram.TransferChecked` instruction in the payment transaction. The values may or may not be unique to the payment request, and may or may not correspond to an account on Solana.

Because Solana validators index transactions by these account keys, `reference` values can be used as client IDs (IDs usable before knowing the eventual payment transaction). The [`getSignaturesForAddress`](https://docs.solana.com/developing/clients/jsonrpc-api#getsignaturesforaddress) RPC method can be used locate transactions this way.

### Label
A single `label` field is allowed as an optional query parameter. The value must be a [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) UTF-8 string that describes the source of the transfer request.

For example, this might be the name of a brand, store, application, or person making the request. The wallet should [URL-decode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent) the value and display the decoded value to the user.

### Message
A single `message` field is allowed as an optional query parameter. The value must be a [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) UTF-8 string that describes the nature of the transfer request.

For example, this might be the name of an item being purchased, an order ID, or a thank you note. The wallet should [URL-decode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent) the value and display the decoded value to the user.

### Memo
A single `memo` field is allowed as an optional query parameter. The value must be a [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) UTF-8 string that must be included in an [SPL Memo](https://spl.solana.com/memo) instruction in the payment transaction.

The wallet must [URL-decode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent) the value and should display the decoded value to the user. The memo will be recorded by validators and should not include private or sensitive information.

If the field is provided, the wallet must include a `MemoProgram` instruction as the second to last instruction of the transaction, immediately before the SOL or SPL Token transfer instruction, to avoid ambiguity with other instructions in the transaction.

### Examples

##### URL describing a transfer request for 1 SOL.
```
solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId12345
```

##### URL describing a transfer request for 0.01 USDC.
```
solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

##### URL describing a transfer request for SOL. The user must be prompted for the amount.
```
solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN&label=Michael
```

## Specification: Interactive Request

A Solana Pay interactive request URL describes an interactive request where the parameters in the URL are used by a wallet to make an HTTP request to a remote server. Currently two types of interactive requests exist:

1. Transaction Request: A Solana Pay transaction request URL describes an interactive request that returns any Solana transaction.
2. Sign-message Request: A Solana Pay sign-message request URL describes an interactive request that is used to verify ownership of an address.

The request URL structure for both types of interactive requests are the same. As such, wallets will not know which type of interaction is being requested until the POST request response payload is received from the server.

### Link
```html
solana:<link>
```

A single `link` field is required as the pathname. The value must be a conditionally [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) absolute HTTPS URL.

If the URL contains query parameters, it must be URL-encoded. Protocol query parameters may be added to this specification. URL-encoding the value prevents conflicting with protocol parameters.

If the URL does not contain query parameters, it should not be URL-encoded. This produces a shorter URL and a less dense QR code.

In either case, the wallet must [URL-decode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent) the value. This has no effect if the value isn't URL-encoded. If the decoded value is not an absolute HTTPS URL, the wallet must reject it as **malformed**.

#### GET Request

The wallet should make an HTTP `GET` JSON request to the URL. The request should not identify the wallet or the user.

The wallet should make the request with an [Accept-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding), and the application should respond with a [Content-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding) for HTTP compression.

The wallet should display the domain of the URL as the request is being made.

#### GET Response

The wallet must handle HTTP [client error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses), [server error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses), and [redirect responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages). The application must respond with these, or with an HTTP `OK` JSON response with a body of
```json
{"label":"<label>","icon":"<icon>"}
```

The `<label>` value must be a UTF-8 string that describes the source of the transaction request. For example, this might be the name of a brand, store, application, or person making the request.

The `<icon>` value must be an absolute HTTP or HTTPS URL of an icon image. The file must be an SVG, PNG, or WebP image, or the wallet must reject it as **malformed**.

The wallet should not cache the response except as instructed by [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching) response headers.

The wallet should display the label and render the icon image to user.

### Transction Request

#### POST Request

The wallet must make an HTTP `POST` JSON request to the URL with a body of
```json
{"account":"<account>"}
```

The `<account>` value must be the base58-encoded public key of an account that may sign the transaction.

The wallet should make the request with an [Accept-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding), and the application should respond with a [Content-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding) for HTTP compression.

The wallet should display the domain of the URL as the request is being made. If a `GET` request was made, the wallet should also display the label and render the icon image from the response.

#### POST Response

The wallet must handle HTTP [client error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses), [server error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses), and [redirect responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages). The application must respond with these, or with an HTTP `OK` JSON response with a body of
```json
{"transaction":"<transaction>"}
```

The `<transaction>` value must be a base64-encoded [serialized transaction](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#serialize). The wallet must base64-decode the transaction and [deserialize it](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#from).

The application may respond with a partially or fully signed transaction. The wallet must validate the transaction as **untrusted**.

If the transaction [`signatures`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#signatures) are empty:
  - The application should set the [`feePayer`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#feePayer) to the `account` in the request, or the zero value (`new PublicKey(0)` or `new PublicKey("11111111111111111111111111111111")`).
  - The application should set the [`recentBlockhash`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#recentBlockhash) to the [latest blockhash](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getLatestBlockhash), or the zero value (`new PublicKey(0).toBase58()` or `"11111111111111111111111111111111"`).
  - The wallet must ignore the [`feePayer`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#feePayer) in the transaction and set the `feePayer` to the `account` in the request.
  - The wallet must ignore the [`recentBlockhash`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#recentBlockhash) in the transaction and set the `recentBlockhash` to the [latest blockhash](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getLatestBlockhash).

If the transaction [`signatures`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#signatures) are nonempty:
  - The application must set the [`feePayer`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#feePayer) to the [public key of the first signature](https://solana-labs.github.io/solana-web3.js/modules.html#SignaturePubkeyPair).
  - The application must set the [`recentBlockhash`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#recentBlockhash) to the [latest blockhash](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getLatestBlockhash).
  - The application must serialize and deserialize the transaction before signing it. This ensures consistent ordering of the account keys, as a workaround for [this issue](https://github.com/solana-labs/solana/issues/21722).
  - The wallet must not set the  [`feePayer`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#feePayer) and [`recentBlockhash`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#recentBlockhash).
  - The wallet must verify the signatures, and if any are invalid, the wallet must reject the transaction as **malformed**.

The wallet must only sign the transaction with the `account` in the request, and must do so only if a signature for the `account` in the request is expected.

If any signature except a signature for the `account` in the request is expected, the wallet must reject the transaction as **malicious**.

The application may also include an optional `message` field in the response body:
```json
{"message":"<message>","transaction":"<transaction>"}
```

The `<message>` value must be a UTF-8 string that describes the nature of the transaction response.

For example, this might be the name of an item being purchased, a discount applied to the purchase, or a thank you note. The wallet should display the value to the user.

The wallet and application should allow additional fields in the request body and response body, which may be added by future specification.

### Transation Request Example

##### URL describing a transaction request.
```
solana:https://example.com/solana-pay/transction-request
```

##### URL describing a transaction request with query parameters.
```
solana:https%3A%2F%2Fexample.com%2Fsolana-pay%2Ftransaction-request%3Forder%3D12345
```

##### GET Request
```
GET /solana-pay/transaction-request?order=12345 HTTP/1.1
Host: example.com
Connection: close
Accept: application/json
Accept-Encoding: br, gzip, deflate
```

##### GET Response
```
HTTP/1.1 200 OK
Connection: close
Content-Type: application/json
Content-Length: 62
Content-Encoding: gzip

{"label":"Michael Vines","icon":"https://example.com/icon.svg"}
```

##### POST Request
```
POST /solana-pay/transction-request?order=12345 HTTP/1.1
Host: example.com
Connection: close
Accept: application/json
Accept-Encoding: br, gzip, deflate
Content-Type: application/json
Content-Length: 57

{"account":"mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN"}
```

##### POST Response
```
HTTP/1.1 200 OK
Connection: close
Content-Type: application/json
Content-Length: 298
Content-Encoding: gzip

{"message":"Thanks for all the fish","transaction":"AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECC4JMKqNplIXybGb/GhK1ofdVWeuEjXnQor7gi0Y2hMcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQECAAAMAgAAAAAAAAAAAAAA"}
```
### Sign-message Request

#### POST Request

The wallet must make an HTTP `POST` JSON request to the URL with a body of
```json
{"account":"<account>"}
```

The `<account>` value must be the base58-encoded public key of the account that will sign the message.

The wallet should make the request with an [Accept-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding), and the application should respond with a [Content-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding) for HTTP compression.

The wallet should display the domain of the URL as the request is being made. If a `GET` request was made, the wallet should also display the label and render the icon image from the response.

#### POST Response

The wallet must handle HTTP [client error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses), [server error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses), and [redirect responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages). The application must respond with these, or with an HTTP `OK` JSON response with a body of
```json
{"data":"<data>","state":"<state>"}
```

The `<data>` value must be a [UTF-8 encoded](https://developer.mozilla.org/en-US/docs/Glossary/UTF-8) string value. The wallet must sign the `data` value with the private key that corresponds to the `account` in the request and send the resulting signature back to the server in the proceeding [PUT request](https://github.com/bedrock-foundation/solana-pay/edit/master/SPEC.md#put-request).

The `<state>` value must be a UTF-8 encoded string value that functions as a MAC. The wallet will pass this value back to the server in the [PUT request](https://github.com/bedrock-foundation/solana-pay/edit/master/SPEC.md#put-request) in order to verify that the contents of the `<data>` field were not modified.


The application may also include an optional `message` field in the response body:
```json
{"message":"<message>","data":"<data>","state":"<state>"}
```

The `<message>` value must be a UTF-8 string that describes the nature of the sign-message response.

For example, this might be the name of the application or event with which the user is interacting, context about how the sign-message request is being used, or a thank you note. The wallet should display the value to the user.

The wallet and application should allow additional fields in the request body and response body, which may be added by future specification.

#### PUT Request

The PUT request is used to send the results of signing the message back to the server. The wallet must make an HTTP `PUT` JSON request to the URL with a body of
```json
{"account":"<account>","state":"<state>","signature":"<signature>"}
```

The `<account>` value must be the base58-encoded public key of the account that signed the message.

The `<state>` value must be the unmodifed UTF-8-encoded `<state>` value from the response of the preceeding POST request.

The `<signature>` value is the base-58 encoded signature from signing the `<data>` field with the users private key.

The wallet should make the request with an [Accept-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding), and the application should respond with a [Content-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding) for HTTP compression.

The wallet should display the domain of the URL as the request is being made. If a `GET` request was made, the wallet should also display the label and render the icon image from the response.

#### PUT Response

The wallet must handle HTTP [client error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses), [server error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses), and [redirect responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages). The application must respond with these, or with an HTTP `OK` JSON response with a body of
```json
{"success":"<success>"}
```

The `<success>` value must be a boolean value indicating whether signature verification succeeded or failed.

The wallet and application should allow additional fields in the request body and response body, which may be added by future specification.

### Sign-message Request Example

##### URL describing a sign-message request.
```
solana:https://example.com/solana-pay/sign-message
```

##### URL describing a sign-message request with query parameters.
```
solana:https%3A%2F%2Fexample.com%2Fsolana-pay%2Fsign-message%3Fid%3D678910
```

##### GET Request
```
GET /solana-pay/sign-message?id=678910 HTTP/1.1
Host: example.com
Connection: close
Accept: application/json
Accept-Encoding: br, gzip, deflate
```

##### GET Response
```
HTTP/1.1 200 OK
Connection: close
Content-Type: application/json
Content-Length: 62
Content-Encoding: gzip

{"label":"Michael Vines","icon":"https://example.com/icon.svg"}
```

##### POST Request
```
POST /solana-pay/sign-message?id=678910 HTTP/1.1
Host: example.com
Connection: close
Accept: application/json
Accept-Encoding: br, gzip, deflate
Content-Type: application/json
Content-Length: 57

{"account":"mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN"}
```

##### POST Response
```
HTTP/1.1 200 OK
Connection: close
Content-Type: application/json
Content-Length: 298
Content-Encoding: gzip

{"message":"Sign the message to login","data":"SIGN_THIS_MESSAGE","state":"eyJhbGciOiJIUzI1NiJ9.U0lHTl9USElTX01FU1NBR0U.KcZ1FnrT1ImAL-7LbALfZOx9F4I4LMuEE8_bg5Zmec4"}
```

##### PUT Request
```
POST /solana-pay/sign-message?id=678910 HTTP/1.1
Host: example.com
Connection: close
Accept: application/json
Accept-Encoding: br, gzip, deflate
Content-Type: application/json
Content-Length: 57

{"account":"mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN", "signature":"3ApozYFyp2ZxWuGvJS7Q1oV8M3YsLMV3WmwbjGCgktqXfdevjCZ92vA4F9V7Xj7KrN7JTtYStBSBeWnNN7vyHkg5","state":"eyJhbGciOiJIUzI1NiJ9.U0lHTl9USElTX01FU1NBR0U.KcZ1FnrT1ImAL-7LbALfZOx9F4I4LMuEE8_bg5Zmec4"}
```

##### PUT Response
```
HTTP/1.1 200 OK
Connection: close
Content-Type: application/json
Content-Length: 298
Content-Encoding: gzip

{"success":true}
```

## Extensions

Additional formats and fields may be incorporated into this specification to enable new use cases while ensuring compatibility with apps and wallets.

Please open a Github issue to propose changes to the specification in order to solicit feedback from application and wallet developers.

[An actual example of such a proposal.](https://github.com/solana-labs/solana-pay/issues/26)
