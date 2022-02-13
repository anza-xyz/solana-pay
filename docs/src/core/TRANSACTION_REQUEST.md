# Transaction Requests

Blockchain-based payments are infinitely more flexible and powerful than traditional payments. It's possible to do things like an in-transaction swap to let a user pay a merchant with any token or currency, and NFTs could work like discount codes or gift cards. Even non-technical merchants will be able to set up loyalty programs that reward users regularly shopping with them without the overhead of extra systems the user and merchant need to understand.

Transaction Requests allow a merchant and wallet to communicate before forming and presenting a transaction to the user. Transaction Requests let developers consider the user's wallet and identity before deciding on transaction details. Let's explore a few possible use-cases:

**Discount**
When the wallet calls the URL provided in the `request` param, it will include the user's public key. A developer could check that the wallet is holding a specific NFT and either apply a discount or not charge the user.

**Authorization**
An app might hold some amount of state about their users off-chain. By using a Transaction Request, the app could use the public key to find the user's account to decide if they are authorized to make this transaction or use it to determine the amount.

**Loyalty**
A merchant could create a simple loyalty program that gives a user $10 off every time they make five transactions. When the merchant's API is called to provide a transaction, it can find all transactions a public key has made to see if it meets the criteria to get $10 off.

## References
* This specification draws in part from https://en.bitcoin.it/wiki/BIP_0072, relying on HTTPS for transmitting and authenticating arbitrary transaction payloads.
