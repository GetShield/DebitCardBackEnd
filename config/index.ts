import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
export const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
export const CMC_API_KEY = process.env.CMC_API_KEY || '';
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const MONGOURI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
export const MORALIS_API_KEY = process.env.MORALIS_API_KEY || '';
export const PORT = process.env.PORT || 8080;
export const RAMP_API_URL = process.env.RAMP_API_URL || '';
export const RAMP_CLIENT_ID = process.env.RAMP_CLIENT_ID || '';
export const RAMP_SECRET_ID = process.env.RAMP_SECRET_ID || '';
export const SHIELD_USERID = process.env.SHIELD_USERID || '';
export const TATUM_API_KEY = process.env.TATUM_API_KEY || '';
export const TRON_API_KEY = process.env.TRON_API_KEY || '';
export const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
export const TATUM_EXCHANGE_RATE_URL =
  process.env.TATUM_EXCHANGE_RATE_URL || '';

export const CHAIN_TYPE = {
  BTC: 'bitcoin',
  ETH: 'evm',
  TRON: 'tvm',
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
  eth: '0x9e75e5185c7bd59f04147a28e3e663df674da2a0',
  tron: 'TWNxsGw1o4rnP4FExQSEXuYzLtXm3dMkRd',
  sepolia: '0x3A2cfA4ceCcB92FfeB6953Eec492612E79c119a3',
  nile: 'TW7ZnpizoTh3HfKFUHMEDMim8M1LrWXueB',
  testnet: '2N3BrPtana8j8Mw2T4o42Cpin5TqXzDtdRN',
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

export type Token = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'USDD' | 'TRX';

export const PLATFORM_ADDRESSES = {
  'bitcoin-mainnet': 'bc1qv06tjpcqmmfprv9m226ue52xvljg93pa5knsly',
  'bitcoin-testnet': 'tb1qnz7l8tujzsty53pwvgsr2v4j3we2nlh0tp424d',
  'ethereum-sepolia': '0x939CaC66A13a8F777cc898B81c98eF50eC97796D',
  'ethereum-mainnet': '0x939CaC66A13a8F777cc898B81c98eF50eC97796D',
  'tron-mainnet': 'TG8G6qYAzCxSwR8Bzf2CJuBjU8qQ4MFxx2',
  'tron-testnet': 'TG8G6qYAzCxSwR8Bzf2CJuBjU8qQ4MFxx2',
};

export default {
  CHAIN_MAP,
  CHAIN_TYPE,
  CMC_API_KEY,
  JWT_SECRET,
  MONGOURI,
  MORALIS_API_KEY,
  PLATFORM_ADDRESSES,
  PORT,
  RAMP_API_URL,
  RAMP_CLIENT_ID,
  RAMP_SECRET_ID,
  SHIELD_USERID,
  TAGET_WALLET_ADDRESS,
  TATUM_API_KEY,
  TATUM_EXCHANGE_RATE_URL,
  TOKEN_MAP,
  TOKENS,
  TRON_API_KEY,
  WEBHOOK_URL,
};
