import { Network } from '@tatumio/tatum';

export type Chain = 'Bitcoin' | 'Ethereum' | 'Tron';

export const SUPPORTED_TESTNET_NETWORKS = [
  Network.BITCOIN_TESTNET,
  Network.ETHEREUM_SEPOLIA,
  Network.TRON_SHASTA,
];

export const SUPPORTED_MAINNET_NETWORKS = [
  Network.BITCOIN,
  Network.ETHEREUM,
  Network.TRON,
];

export const SUPPORTED_CHAINS = ['Ethereum', 'Bitcoin', 'Tron'];

// https://apidoc.tatum.io/tag/Exchange-rate#operation/getExchangeRate
export const BTC_CURRENCY = 'BTC';
export const ETH_CURRENCY = 'ETH';
export const TRON_CURRENCY = 'TRON';
export const USD_BASE_PAIR = 'USD';
