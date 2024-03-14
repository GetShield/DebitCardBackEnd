export interface Balance {
  _id: string;
  blockchain: Blockchain;
  crypto: string;
  wallet: Wallet;
  __v: number;
  amount: number;
}

interface Blockchain {
  _id: string;
  mainnet: boolean;
  chainType: string;
  chainId: number;
  name: string;
  native_symbol: string;
  description: string;
  wallets: string[];
}

interface Wallet {
  _id: string;
  date: string;
  address: string;
  blockchains: string[];
  user: string;
  __v: number;
}
