// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('DebitCardDB');

// Create a new document in the collection.
db.getCollection('blockchains').insertMany([
  {
    chain: 'bitcoin-mainnet',
    nativeSymbol: 'BTC',
    chain_type: 'bitcoin',
    wallets: [],
  },
  {
    chain: 'tron-mainnet',
    nativeSymbol: 'TRX',
    wallets: [],
    chain_type: 'tvm',
    // Tron mainnet specific ID if applicable, but generally not labeled as "chainId" in Ethereum's sense.
  },
  {
    chain: 'ethereum-mainnet',
    chainId: 1,
    nativeSymbol: 'ETH',
    chain_type: 'evm',
    wallets: [],
  },
  {
    chain: 'bitcoin-testnet',
    nativeSymbol: 'BTC',
    chain_type: 'bitcoin',
    wallets: [],
  },
  {
    chain: 'tron-testnet',
    nativeSymbol: 'TRX',
    chain_type: 'tvm',
    wallets: [],
    // Tron Nile testnet specific ID if applicable.
  },
  {
    chain: 'ethereum-sepolia',
    chainId: 11155111,
    nativeSymbol: 'ETH',
    chain_type: 'evm',
    wallets: [],
  },
]);
