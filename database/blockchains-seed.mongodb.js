// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("DebitCardDB");

// Create a new document in the collection.
db.getCollection("blockchains").insertMany([
  {
    name: "bitcoin",
    native_symbol: "BTC",
    wallets: [],
  },
  {
    name: "tron",
    native_symbol: "TRX",
    wallets: [],
    // Tron mainnet specific ID if applicable, but generally not labeled as "chainId" in Ethereum's sense.
  },
  {
    name: "ethereum",
    chainId: 1,
    native_symbol: "ETH",
    wallets: [],
  },
  {
    name: "nile",
    native_symbol: "TRX",
    wallets: [],
    // Tron Nile testnet specific ID if applicable.
  },
  {
    name: "sepolia",
    chainId: 11155111,
    native_symbol: "ETH",
    wallets: [],
  },
]);
