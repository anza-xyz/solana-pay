# @solana/pay

Payments SDK based around the token transfer URI scheme defined here: https://github.com/solana-labs/solana/issues/19535

There are some parts of a JS reference implementation here, but we will want to think about mobile (iOS, Android, React
Native) as well.

There are a few user flows that we have in mind.

## A. Web app to browser wallet (or mobile wallet's webview)

Transactions can be created by the app, signed by the wallet, and sent by the app.

In this flow, the SDK just wraps wallet-adapter, and makes it easy for merchant apps to send transactions. Connecting to
the wallet first like dapps currently do is required.

## B. Web app to mobile wallet

Payment requests can be encoded as a URI according to the scheme, scanned using a QR code, sent and confirmed by the
wallet, and discovered by the app. Unlike WalletConnect, this isn't general purpose, it's just for token transfers.
There is no step to connect a wallet or create a session.

In this flow, the SDK generates a URI containing a unique ID for the payment in the memo field. Upon presenting the QR
code, the app starts subscribing to or polling the RPC for transactions with that memo starting at the last observed
block.

The user scans the link with their camera or mobile wallet. The wallet handles the link, parses the URL and creates the
payment transaction as is done in the reference implementation, signs, sends, and confirms it.

The app discovers the confirmed transaction by looking for the memo. If the app optimistically persists the ID in the
memo and the observed block, the payment can go through on the wallet side, and then the app or merchant's API can still
find and associate the payment to a user or sale after the fact.

Perhaps the app includes a "good until block" parameter in the URI so the wallet doesn't prompt the user to sign
afterward. This keeps the search space for the memo in the app or backend manageable.

## C. Mobile app to mobile wallet

Payment requests can be encoded as a URI, a deep link, another format using App Extensions on iOS and Intent/Activity on
Android, or some other mechanism TBD.

The app prepares a payment request, and passes control to the wallet. The wallet signs, sends, and confirms it, or
cancels the request.

The wallet returns control to the app along with the transaction signature or some other data TBD.
