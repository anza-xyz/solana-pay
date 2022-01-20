# Point of Sale Starter

The main purpose of this app is to show a working Point of Sale integration with Solana Pay.

## Prerequisites

To build and run this app locally, you'll need:

-   Node version 14
-   yarn
-   <details>
        <summary> Setup two wallets on <a href="https://phantom.app/">Phantom</a> (Merchant and Payee) </summary>

    #### 1. Create merchant wallet

    Follow the [guide][1] on how to create a wallet. This wallet is the recipient / recieving address.

    #### 2. Create Payee wallet

    Follow the [guide][1] on how to create a wallet. This wallet will be paying for the goods/services.

    #### 3. Set Phantom to connect to devnet

    1. Click the settings icon in the Phantom window
    2. Select the "Change network" option and select "Devnet"

    #### 4. Airdrop SOL to payee wallet

    Use [solfaucet][3] to airdrop SOL to the payee wallet.

    > You'll need SOL in the payee wallet to pay for the goods/services + transaction fees

 </details>

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installing / Set-up

Clone the repository

**With https:**

```shell
git clone https://github.com/solana-labs/solana-pay.git
```

**With Github CLI**

```shell
gh repo clone solana-labs/solana-pay
```

Install dependencies for point-of-sale

```shell
cd point-of-sale
yarn install
```

## How to run locally

Start the local dev server

```shell
yarn start
```

## License

This project is licensed under the Apache License - see the [LICENSE.md](LICENSE.md) file for details

<!-- Links -->

[1]: https://help.phantom.app/hc/en-us/articles/4406388623251-How-to-create-a-new-wallet
[3]: https://solfaucet.com/
