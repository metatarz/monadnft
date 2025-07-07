# Monad NFT Tool (Node.js)

A lightweight Node.js tool to interact with existing NFTs on the Monad testnet.

## Features
- Check NFT collection details (name, symbol)
- View NFT balance for any address
- Transfer NFTs between wallets
- Works with any standard ERC-721 NFT contract

## Prerequisites
- Node.js (v20 or newer)
- A Monad testnet wallet with testnet ETH
- An existing NFT contract address

## Setup

1. Clone this repo and cd to it.
2. Install deps

```bash 
npm install

```
3. Create an .env file (see .env.example for reference)

## Usage

1. Check your NFT balance

```sh
node main.mjs --action=balance --address=0x123...
```


2. Transfer your NFTs

```sh
node main.mjs --action=transfer --to=0x456... --tokenId=1

```

### Interactive Mode

```sh
node main.mjs
```

## Available Commands

|Flag                     |Description                          |
|--------------------------|--------------------------------------|
| `--action=balance`       | Check NFT balance                    |
| `--address=0x...`        | Wallet address to check              |
| `--action=transfer`      | Transfer an NFT                      |
| `--to=0x...`             | Recipient address                    |
| `--tokenId=1`            | NFT ID to transfer                   |
| `--interactive`          | Launch interactive mode (default)    |

## License

MIT