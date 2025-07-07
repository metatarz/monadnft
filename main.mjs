#!/usr/bin/env node
import { ethers } from "ethers";
import dotenv from "dotenv";
import inquirer from "inquirer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Config
dotenv.config();

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ERC-721 ABI
const NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)"
];

// Initialize contract
const nftContract = new ethers.Contract(
  process.env.NFT_CONTRACT_ADDRESS,
  NFT_ABI,
  wallet
);

// CLI Actions
async function checkBalance(address = wallet.address) {
  const [balance, name] = await Promise.all([
    nftContract.balanceOf(address),
    nftContract.name()
  ]);
  console.log(`\n📊 ${address} owns ${balance} NFTs in "${name}" collection`);
}

async function transferNFT(to, tokenId) {
  console.log(`\n🔄 Attempting to transfer NFT #${tokenId} to ${to}...`);
  const tx = await nftContract.safeTransferFrom(wallet.address, to, tokenId);
  await tx.wait();
  console.log(`✅ Success! Transaction hash: ${tx.hash}`);
}

async function showCollectionInfo() {
  const [name, symbol] = await Promise.all([
    nftContract.name(),
    nftContract.symbol()
  ]);
  console.log(`\n📜 Collection Info:\nName: ${name}\nSymbol: ${symbol}`);
}

// Interactive Mode
async function interactiveMode() {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: [
      "Check balance",
      "Transfer NFT",
      "View collection info",
      "Exit"
    ]
  });

  switch (action) {
    case "Check balance":
      const { address } = await inquirer.prompt({
        type: "input",
        name: "address",
        message: "Enter address to check:",
        default: wallet.address
      });
      await checkBalance(address);
      break;

    case "Transfer NFT":
      const { recipient } = await inquirer.prompt({
        type: "input",
        name: "recipient",
        message: "Recipient address:",
        validate: input => ethers.isAddress(input) || "Invalid address"
      });
      const { tokenId } = await inquirer.prompt({
        type: "input",
        name: "tokenId",
        message: "NFT ID to transfer:",
        validate: input => !isNaN(input) || "Must be a number"
      });
      await transferNFT(recipient, tokenId);
      break;

    case "View collection info":
      await showCollectionInfo();
      break;

    case "Exit":
      process.exit(0);
  }

  // Return to menu
  setTimeout(interactiveMode, 1000);
}

// Command-line mode
async function parseArgs() {
  const argv = await yargs(hideBin(process.argv))
    .option("action", {
      alias: "a",
      type: "string",
      choices: ["balance", "transfer", "info"],
      description: "Action to perform"
    })
    .option("address", {
      type: "string",
      description: "Wallet address to check"
    })
    .option("to", {
      type: "string",
      description: "Recipient address for transfers"
    })
    .option("tokenId", {
      type: "number",
      description: "NFT ID to transfer"
    })
    .argv;

  return argv;
}

// Main execution
(async () => {
  const args = await parseArgs();

  if (args.action) {
    // Command-line mode
    switch (args.action) {
      case "balance":
        await checkBalance(args.address || wallet.address);
        break;
      case "transfer":
        if (!args.to || args.tokenId === undefined) {
          console.error("❌ Error: --to and --tokenId required for transfers");
          process.exit(1);
        }
        await transferNFT(args.to, args.tokenId);
        break;
      case "info":
        await showCollectionInfo();
        break;
    }
  } else {
    // Interactive mode
    console.log("\n🦎 Monad NFT CLI Tool\n");
    await interactiveMode();
  }
})();