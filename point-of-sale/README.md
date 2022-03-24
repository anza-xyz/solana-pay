# Point of Sale

This is an example of how you can use the `@solana/pay` JavaScript library to create a simple point of sale system.

You can [check out the app](https://app.solanapay.com?recipient=GvHeR432g7MjN9uKyX3Dzg66TqwrEWgANLnnFZXMeyyj&label=Solana+Pay), use the code as a reference, or run it yourself to start accepting decentralized payments in-person.

## Prerequisites

To build and run this app locally, you'll need:

-   Node.js v14.17.0 or above
-   Yarn
-   <details>
        <summary> Setup two wallets on <a href="https://phantom.app">Phantom</a> (Merchant and Customer) </summary>

    #### 1. Create merchant wallet

    Follow the [guide][1] on how to create a wallet. This wallet will provide the recipient address.

    #### 2. Create customer wallet

    Follow the [guide][1] on how to create another wallet. This wallet will be paying for the goods/services.

    #### 3. Set Phantom to connect to devnet

    1. Click the settings icon in the Phantom window
    2. Select the "Change network" option and select "Devnet"

    #### 4. Airdrop SOL to customer wallet

    Use [solfaucet][3] to airdrop SOL to the customer wallet.

    > You'll need SOL in the customer wallet to pay for the goods/services + transaction fees

 </details>

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Clone the repository

#### With Git
```shell
git clone https://github.com/solana-labs/solana-pay.git
```

#### With Github CLI
```shell
gh repo clone solana-labs/solana-pay
```

### Install dependencies
```shell
cd solana-pay/point-of-sale
yarn install
```

### Start the local dev server
```shell
yarn dev
```

### In a separate terminal, run a local SSL proxy
```shell
yarn proxy
```

### Open the point of sale app
```shell
open "https://localhost:3001?recipient=Your+Merchant+Address&label=Your+Store+Name"
```

You may need to accept a locally signed SSL certificate to open the page.

## Accepting USDC on Mainnet
Import the Mainnet endpoint, along with USDC's mint address and icon in the `App.tsx` file.
```jsx
import { MAINNET_ENDPOINT, MAINNET_USDC_MINT } from '../../utils/constants';
import { USDCIcon } from '../images/USDCIcon';
```

In the same file, set the `endpoint` value in the `<ConnectionProvider>` to `MAINNET_ENDPOINT` and set the following values in the `<ConfigProvider>`:

```tsx
splToken={MAINNET_USDC_MINT}
symbol="USDC"
icon={<USDCIcon />}
decimals={6}
minDecimals={2}
```

**Make sure to use 6 decimals for USDC!**

When you're done, it should look like this:

```jsx
<ConnectionProvider endpoint={MAINNET_ENDPOINT}>
    <WalletProvider wallets={wallets} autoConnect={connectWallet}>
        <WalletModalProvider>
            <ConfigProvider
                baseURL={baseURL}
                link={link}
                recipient={recipient}
                label={label}
                message={message}
                splToken={MAINNET_USDC_MINT}
                symbol="USDC"
                icon={<USDCIcon />}
                decimals={6}
                minDecimals={2}
                connectWallet={connectWallet}
            >
```

## Using Transaction Requests

[Transaction Requests](../SPEC.md#specification-transaction-request) are a new feature in Solana Pay.

**More details coming soon!** <!-- TODO -->

## Deploying to Vercel

You can deploy this point of sale app to Vercel with a few clicks. Fork the project and configure it like this:

**More details coming soon!** <!-- TODO -->

Once the deployment finishes, navigate to
```
https://<YOUR DEPLOYMENT URL>?recipient=<YOUR WALLET ADDRESS>&label=Your+Store+Name
```

## License

The Solana Pay Point of Sale app is open source and available under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for more info.

<!-- Links -->

[1]: https://help.phantom.app/hc/en-us/articles/4406388623251-How-to-create-a-new-wallet
[3]: https://solfaucet.com/
