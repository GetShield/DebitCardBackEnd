import {
  TatumSDK,
  Ethereum,
  Bitcoin,
  Tron,
  Network,
  ResponseDto,
  NotificationSubscription,
  Status,
} from '@tatumio/tatum';
import logger from 'node-color-log';
import config from '../config';

const envFile =
  process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
require('dotenv').config({ path: envFile });

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

const chainToTypeMap: {
  [key: string]: typeof Ethereum | typeof Tron | typeof Bitcoin;
} = {
  Ethereum,
  Tron,
  Bitcoin,
};

const subscribe = async (chain: Chain, network: Network, address: string) => {
  let tatum = await tatumSdk(chain, network);
  const subscription = await tatum.notification.subscribe.incomingNativeTx({
    address,
    url: process.env.WEBHOOK_URL as string,
  });

  if (subscription.status == Status.ERROR) {
    logger.error(`${subscription.error!.message}`);
    process.exit(1);
  }

  logger.info(`Subscribed to network ${network} for address ${address}`);
};

export const setupSubscriptions = async () => {
  logger.info('Checking network subscribtions.');

  const randomChain = SUPPORTED_CHAINS[0] as Chain;
  const network = tatumNetwork(randomChain);
  let tatum = await tatumSdk(randomChain, network);

  const { data }: ResponseDto<NotificationSubscription[]> =
    await tatum.notification.getAll();

  let result = await Promise.all(
    data.map(async (data) => {
      const network = findNetworkStartingWithPrefix(
        getKeyFromValue(data.network) as Chain
      );
      return network;
    })
  );

  const notSubscribed = supportedNetworks().filter(
    (element) => !result.includes(element)
  );

  const common = supportedNetworks().filter((element) =>
    result.includes(element)
  );

  logger.info(`Subscribed to notifications on networks <${common}>.`);

  if (notSubscribed.length) {
    logger.info(`Subscribing to networks ${notSubscribed}.`);

    await Promise.all(
      notSubscribed.map(async (network) => {
        let chain = networkToChain(network);
        await subscribe(
          chain,
          network,
          config.PLATFORM_ADDRESSES[
            network as keyof typeof config.PLATFORM_ADDRESSES
          ]
        );
      })
    );
  }
};

// Create a `TatumSDK` instance specifying the chain and network
const tatumSdk = async (chain: Chain, network: Network) => {
  const ChainType = chainToTypeMap[chain];
  if (!ChainType) {
    throw new Error(`Unknown chain: ${chain}`);
  }

  return await TatumSDK.init<InstanceType<typeof ChainType>>({
    network,
    apiKey: process.env.TATUM_TESTNET_API_KEY as string,
    retryCount: 5,
  });
};

const networkToChain = (network: Network): Chain => {
  switch (true) {
    case network.startsWith('ethereum'):
      return 'Ethereum';
    case network.startsWith('bitcoin'):
      return 'Bitcoin';
    case network.startsWith('tron'):
      return 'Tron';
    default:
      throw new Error(`Unknown network: ${network}`);
  }
};

const tatumNetwork = (chain: Chain): Network => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const networkMapping = {
    Ethereum: isDevelopment ? Network.ETHEREUM_SEPOLIA : Network.ETHEREUM,
    Bitcoin: isDevelopment ? Network.BITCOIN_TESTNET : Network.BITCOIN,
    Tron: isDevelopment ? Network.TRON_SHASTA : Network.TRON,
  };

  const selectedNetwork = networkMapping[chain];

  if (!selectedNetwork) {
    throw new Error(`Unknown chain: ${chain}`);
  }

  return selectedNetwork;
};

const supportedNetworks = (): Array<Network> => {
  if (process.env.NODE_ENV === 'development') {
    return SUPPORTED_TESTNET_NETWORKS;
  }

  return SUPPORTED_MAINNET_NETWORKS;
};

const getKeyFromValue = (value: string): string | undefined => {
  const keys = Object.keys(Network).filter(
    (key) => Network[key as keyof typeof Network] === value
  );
  return keys.length > 0 ? keys[0] : undefined;
};

const findNetworkStartingWithPrefix = (chain: Chain): Network => {
  const networks = supportedNetworks();
  for (let element of networks) {
    if (element.toLowerCase().startsWith((chain as string).toLowerCase())) {
      return element;
    }
  }

  throw new Error('No network found');
};
