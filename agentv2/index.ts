import {
  TatumSDK,
  Ethereum,
  Bitcoin,
  Tron,
  Network,
  ResponseDto,
  ITatumSdkChain,
  NotificationSubscription,
} from '@tatumio/tatum';
const logger = require('node-color-log');
const fs = require('fs');
import { promisify } from 'util';

const envFile = process.env.ENV === 'production' ? '.env' : '.env.development';
require('dotenv').config({ path: envFile });

export type ChainName = 'Bitcoin' | 'Ethereum' | 'Tron';

export interface SupportedNetworks {
  networks: Array<ChainName & string>;
}

export interface Chain<T extends ITatumSdkChain> {
  chain: T;
}

export const setupListeners = async () => {
  await setupSubscriptions();
  // const networkConfigs = [
  //   {
  //     network: Network.ETHEREUM_SEPOLIA,
  //     apiKey: process.env.TATUM_TESTNET_API_KEY as string,
  //   },
  //   // Add more networks here if needed
  // ];

  // const tatum = await TatumSDK.init<Ethereum>({
  //   network: Network.ETHEREUM_SEPOLIA,
  //   apiKey: process.env.TATUM_TESTNET_API_KEY as string,
  //   retryCount: 5,
  // });

  // const monitoredAddress = '0xF64E82131BE01618487Da5142fc9d289cbb60E9d';

  // const subscription = await tatum.notification.subscribe.incomingNativeTx({
  //   address: monitoredAddress,
  //   url: process.env.WEBHOOK_URL as string,
  // });

  // console.log('subscription: ', subscription);

  // console.log(
  //   `Now you will be notified about all incoming ETH transactions on ${monitoredAddress}`
  // );
};

export const setupSubscriptions = async () => {
  const supportedNetworks = await parseSupportedNetworks();

  const result = await Promise.all(
    supportedNetworks.networks.map(async (networkName) => {
      const chain = tatumChain(networkName);
      const network = tatumNetwork(networkName);
      let tatum = await tatumSdk(chain, network);
    })
  );

  const tatum = await TatumSDK.init<Ethereum>({
    network: Network.ETHEREUM_SEPOLIA,
    apiKey: process.env.TATUM_TESTNET_API_KEY as string,
    retryCount: 5,
  });

  const { status, data }: ResponseDto<NotificationSubscription[]> =
    await tatum.notification.getAll();
  console.log(status, data);
};

const parseSupportedNetworks = async (): Promise<SupportedNetworks> => {
  const filePath = process.env.SUPPORTED_NETWORKS;
  const readFileAsync = promisify(fs.readFile);

  try {
    const data = await readFileAsync(filePath, 'utf8');

    let supportedNetworks: SupportedNetworks;
    try {
      supportedNetworks = JSON.parse(data);
    } catch (jsonErr) {
      throw new Error(`Error parsing JSON data: ${jsonErr}`);
    }

    // Validate the structure of the parsed data
    if (!supportedNetworks || !Array.isArray(supportedNetworks.networks)) {
      throw new Error('Invalid format in supported networks file.');
    }

    return supportedNetworks;
  } catch (err) {
    console.error(`Failed to load file ${filePath}, due to error ${err}.`);
    process.exit(1); // Exit the program upon failure
  }
};

// Create a `TatumSDK` instance specifying the chain and network
const tatumSdk = async <T extends ITatumSdkChain>(
  chain: T,
  network: Network,
): Promise<TatumSDK> => {
  return await TatumSDK.init<T>({
    network,
    apiKey: process.env.TATUM_TESTNET_API_KEY as string,
    // retryCount: 5,
  });
};

const tatumChain = (chainName: ChainName) => {
  switch (chainName) {
    case 'Ethereum':
      return Ethereum;
    case 'Bitcoin':
      return Bitcoin;
    case 'Tron':
      return Tron;
    default:
      throw new Error(`Unknown chain: ${chainName}`);
  }
};

const tatumNetwork = (chainName: ChainName) => {
  const isDevelopment = process.env.ENV === 'development';

  const networkMapping = {
    Ethereum: isDevelopment ? Network.ETHEREUM_SEPOLIA : Network.ETHEREUM,
    Bitcoin: isDevelopment ? Network.BITCOIN_TESTNET : Network.BITCOIN,
    Tron: isDevelopment ? Network.TRON_SHASTA : Network.TRON,
  };

  const selectedNetwork = networkMapping[chainName];

  if (!selectedNetwork) {
    throw new Error(`Unknown network: ${chainName}`);
  }

  return selectedNetwork;
};
