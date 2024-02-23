const logger = require('node-color-log');

require('dotenv').config();

// import { fetchEthereumEvents } from "./agent/ethereum-tracker";
import { fetchEvmEvents } from './agent/evm-tracker';
import { fetchTvmEvents } from './agent/tvm-tracker';

logger.info('########## Shield Debit Card ##########');
logger.info('Initializing Blockchain Trackers...');

fetchEvmEvents('sepolia');
fetchEvmEvents('ethereum');
fetchTvmEvents('nile');
