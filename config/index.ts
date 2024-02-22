import { config } from 'dotenv';
config();

export const PORT = process.env.PORT || 8080;
export const MONGOURI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
export const CMC_API_KEY = process.env.CMC_API_KEY || '';
export const MORALIS_API_KEY = process.env.MORALIS_API_KEY || '';

export const CHAIN_TYPE = {
  BTC: 'bitcoin',
  ETH: 'evm',
  TRON: 'tron',
};

export const CHAIN_MAP = {
  eth: {
    name: 'Ethereum Mainnet',
    websocket_url: `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_ETHEREUM}`,
    https_url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_ETHEREUM}`,
  },
  sepolia: {
    name: 'Sepolia Testnet',
    websocket_url: `wss:///eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`,
    https_url: `https:///eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`,
  },
};

export const TAGET_WALLET_ADDRESS = {
  btc: '32KjG6o7TFcYyvHWADpg1m4JoXU4P5QN1L',
  eth: '0x388C818CA8B9251b393131C08a736A67ccB19297', //"0x9e75e5185c7bd59f04147a28e3e663df674da2a0",
  tron: 'TWNxsGw1o4rnP4FExQSEXuYzLtXm3dMkRd',
  sepolia: '0x3A2cfA4ceCcB92FfeB6953Eec492612E79c119a3',
  nile: 'TW7ZnpizoTh3HfKFUHMEDMim8M1LrWXueB',
};

export const TOKEN_MAP = {
  eth: [
    {
      name: 'USDT',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
    },
    {
      name: 'USDC',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
    },
  ],
  tron: [
    {
      name: 'USDT',
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      decimals: 6,
    },
    {
      name: 'USDC',
      address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
      decimals: 6,
    },
    {
      name: 'USDJ',
      address: 'TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT',
      decimals: 18,
    },
  ],

  nile: [
    {
      name: 'USDT',
      address: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
      decimals: 6,
    },
    {
      name: 'USDJ',
      address: 'TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL',
      decimals: 18,
    },
  ],

  sepolia: [
    {
      decimals: 18,
      name: 'USDT',
      address: '0xB6434EE024892CBD8e3364048a259Ef779542475',
    },
  ],
};

export const TOKENS = ['BTC', 'ETH', 'USDT', 'USDC', 'USDD', 'TRX'];

export default {
  PORT,
  MONGOURI,
  CMC_API_KEY,
  MORALIS_API_KEY,
  CHAIN_TYPE,
  CHAIN_MAP,
  TOKEN_MAP,
  TOKENS,
  TAGET_WALLET_ADDRESS,
};
