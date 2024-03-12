import { Network } from '@tatumio/tatum';

export type Chain = 'Bitcoin' | 'Ethereum' | 'Tron';

export const SUPPORTED_TESTNET_NETWORKS = [
  Network.ETHEREUM_SEPOLIA,
  Network.BITCOIN_TESTNET,
  Network.TRON_SHASTA,
];

export const SUPPORTED_MAINNET_NETWORKS = [
  Network.ETHEREUM,
  Network.BITCOIN,
  Network.TRON,
];

export const SUPPORTED_CHAINS = ['Ethereum', 'Bitcoin', 'Tron'];
