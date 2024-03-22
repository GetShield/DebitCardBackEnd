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
import { WEBHOOK_URL, TATUM_API_KEY, PLATFORM_ADDRESSES } from '../config';
import {
  SUPPORTED_CHAINS,
  SUPPORTED_MAINNET_NETWORKS,
  SUPPORTED_TESTNET_NETWORKS,
  Chain,
} from '../config/blockchain';

const chainToTypeMap: {
  [key: string]: typeof Ethereum | typeof Tron | typeof Bitcoin;
} = {
  Ethereum,
  Tron,
  Bitcoin,
};

// Subscribe to notifications for a given blockchain chain and network
const subscribe = async (chain: Chain, network: Network, address: string) => {
  let tatum = await tatumSdk(chain, network);
  const subscription = await tatum.notification.subscribe.incomingNativeTx({
    address,
    url: WEBHOOK_URL,
  });

  if (subscription.status == Status.ERROR) {
    logger.error(`${subscription.error!.message}`);
    process.exit(1);
  }

  logger.info(`Subscribed to network ${network} for address ${address}`);
};

// Set up subscriptions for all supported networks
export const setupSubscriptions = async () => {
  logger.info('Checking network subscribtions.');

  const randomChain = SUPPORTED_CHAINS[0] as Chain;
  const network = mapChainToNetwork(randomChain);
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

  // Subscribe to networks that are not yet subscribed to
  if (notSubscribed.length) {
    logger.info(`Subscribing to networks ${notSubscribed}.`);

    await Promise.all(
      notSubscribed.map(async (network) => {
        let chain = mapNetworkToChain(network);
        await subscribe(
          chain,
          network,
          PLATFORM_ADDRESSES[network as keyof typeof PLATFORM_ADDRESSES]
        );
      })
    );
  }
};

// Initialize the Tatum SDK for a given blockchain chain and network
const tatumSdk = async (chain: Chain, network: Network) => {
  const ChainType = chainToTypeMap[chain];
  if (!ChainType) {
    throw new Error(`Unknown chain: ${chain}`);
  }

  return await TatumSDK.init<InstanceType<typeof ChainType>>({
    network,
    apiKey: TATUM_API_KEY,
    retryCount: 5,
  });
};

// Map a network to its corresponding blockchain chain
const mapNetworkToChain = (network: Network): Chain => {
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

// Map a blockchain chain to its corresponding network
const mapChainToNetwork = (chain: Chain): Network => {
  const isDevelopment = process.env.NODE_ENV === 'dev';

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

// Get supported networks based on the current environment
const supportedNetworks = (): Array<Network> => {
  if (process.env.NODE_ENV === 'dev') {
    return SUPPORTED_TESTNET_NETWORKS;
  }

  return SUPPORTED_MAINNET_NETWORKS;
};

// Get the key corresponding to a given value in the Network enum
const getKeyFromValue = (value: string): string | undefined => {
  const keys = Object.keys(Network).filter(
    (key) => Network[key as keyof typeof Network] === value
  );
  return keys.length > 0 ? keys[0] : undefined;
};

// Find a network starting with the specified prefix
const findNetworkStartingWithPrefix = (chain: Chain): Network => {
  const networks = supportedNetworks();
  for (let element of networks) {
    if (element.toLowerCase().startsWith((chain as string).toLowerCase())) {
      return element;
    }
  }

  throw new Error('No network found');
};
