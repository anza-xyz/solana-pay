# @solana/pay

Payments SDK based around the token transfer URL scheme defined here: https://github.com/solana-labs/solana/issues/19535

There are some parts of a JS reference implementation here, but we will want to think about mobile (iOS, Android, React
Native) as well.

There are a few user flows that we have in mind.

## A. Web app to browser wallet (or mobile wallet's webview)

Transactions can be created by the app, signed by the wallet, and sent by the app.

In this flow, the SDK just wraps wallet-adapter, and makes it easy for merchant apps to send transactions. Connecting to
the wallet first like dapps currently do is required, since the app needs the user's public key to send the transaction.

## B. Web app to mobile wallet

Payment requests can be encoded as a URL according to the scheme, scanned using a QR code, sent and confirmed by the
wallet, and discovered by the app. Unlike WalletConnect, this isn't general purpose, it's just for token transfers.
There is no step to connect a wallet or create a session.

In this flow, the app generates a unique public key representing the transfer request. The SDK encodes a URL referencing
this key. Upon presenting the QR code, the app starts subscribing to or polling the RPC for transactions that reference
the unique key.

The user scans the link with their camera or mobile wallet. The wallet handles the link, parses the URL, create the
payment transaction as is done in the reference implementation, signs, sends, and confirms it.

The app discovers the confirmed transaction by looking for the unique public key it references. The app should
optimistically persist the key, so the payment can go through on the wallet side, and then the app or merchant's API can
find and associate the payment to a user or sale afterwards.

## C. Mobile app to mobile wallet

Payment requests can be encoded as a URL, a deep link, another format using App Extensions on iOS and Intent/Activity on
Android, or some other mechanism TBD.

The app prepares a payment request, and passes control to the wallet. The wallet signs, sends, and confirms it, or
cancels the request.

The wallet returns control to the app along with the transaction signature or some other data TBD.
