// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('DebitCardDB');

// Create a new document in the collection.
db.getCollection('blockchains').insertMany([
  {
    chain: 'bitcoin-mainnet',
    native_symbol: 'BTC',
    chain_type: 'bitcoin',
    wallets: [],
  },
  {
    chain: 'tron-mainnet',
    native_symbol: 'TRX',
    wallets: [],
    chain_type: 'tvm',
    // Tron mainnet specific ID if applicable, but generally not labeled as "chainId" in Ethereum's sense.
  },
  {
    chain: 'ethereum-mainnet',
    chainId: 1,
    native_symbol: 'ETH',
    chain_type: 'evm',
    wallets: [],
  },
  {
    chain: 'bitcoin-testnet',
    native_symbol: 'BTC',
    chain_type: 'bitcoin',
    wallets: [],
  },
  {
    chain: 'tron-testnet',
    native_symbol: 'TRX',
    chain_type: 'tvm',
    wallets: [],
    // Tron Nile testnet specific ID if applicable.
  },
  {
    chain: 'ethereum-sepolia',
    chainId: 11155111,
    native_symbol: 'ETH',
    chain_type: 'evm',
    wallets: [],
  },
]);
