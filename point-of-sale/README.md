# Point of Sale Starter

The main purpose of this app is to show a working Point of Sale integration with Solana Pay.

## Prerequisites

To build and run this app locally, you'll need:

-   Node version 14
-   yarn
-   Build JS library

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

Before running the PoS example, you have to build the JS library:

Install dependencies for JS lib

```shell
cd js
yarn install
```

Build JS library

```shell
# from js project root
yarn build
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
