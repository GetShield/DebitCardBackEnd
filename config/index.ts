export const PORT = 8080;
export const MONGOURI = 'mongodb+srv://shield:rootroot@cluster0.kfkgxdg.mongodb.net/';
export const CMC_API_KEY = '9144af3e-0f3a-4cbc-8511-9e6747dd34ab';
export const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImM1MjYwMDYwLTA2NWUtNDBmNC04ODk0LTNkMmFmMWU1OWExYiIsIm9yZ0lkIjoiMzc3NzAwIiwidXNlcklkIjoiMzg4MTM4IiwidHlwZUlkIjoiNDNhZmVhYjUtZTljNy00ZTA2LWFmMDEtMjI3MmJhYzQ0YzQwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDgxOTk4MDQsImV4cCI6NDg2Mzk1OTgwNH0.ft8WYtBMJC6B1BtBGpZB_0tPiCKcpb2PYNbryHgCZmI'

export const CHAIN_TYPE = {
  BTC: 'btc',
  ETH: 'eth',
  TRON: 'tron',
};

export const CHAIN_MAP = {
  eth: {
    name: "Ethereum Mainnet",
    websocket_url: "wss://eth-mainnet.g.alchemy.com/v2/scS7rThd70YD61xEU80rJAZnQArQ36Dw",
    https_url: "https://eth-mainnet.g.alchemy.com/v2/scS7rThd70YD61xEU80rJAZnQArQ36Dw"
  }
}

export const TAGET_WALLET_ADDRESS = {
  btc: "32KjG6o7TFcYyvHWADpg1m4JoXU4P5QN1L",
  eth: "0x388C818CA8B9251b393131C08a736A67ccB19297", //"0x9e75e5185c7bd59f04147a28e3e663df674da2a0",
  tron: "TWNxsGw1o4rnP4FExQSEXuYzLtXm3dMkRd"
}

export const TOKEN_MAP = {
  eth: [
    {
      name: "USDT",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      decimals: 6
    },
    {
      name: "USDC",
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      decimals: 6
    }
  ],
  tron: [
    {
      name: "USDT",
      address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      decimals: 6
    },
    {
      name: "USDC",
      address: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
      decimals: 6
    }
  ]
}

export const TOKENS = ['BTC', 'ETH', 'USDT', 'USDC'];

export default {
  PORT,
  MONGOURI,
  CMC_API_KEY,
  MORALIS_API_KEY,
  CHAIN_TYPE,
  CHAIN_MAP,
  TOKEN_MAP,
  TOKENS,
  TAGET_WALLET_ADDRESS
};
