const logger = require('node-color-log');

require('dotenv').config();

// import { fetchEthereumEvents } from "./agent/ethereum-tracker";
import { fetchEvmEvents } from './agent/evm-tracker';
import { fetchTvmEvents } from './agent/tvm-tracker';
import { fetchBitcoinEvents } from './agent/bitcoin-tracker';
import balanceModel from './models/balance.model';

import config from './config';
import database from './database';
import router from './routes';

async function init() {
  database.init();

  logger.info('########## Shield Debit Card ##########');
  logger.info('Initializing Blockchain Trackers...');

  fetchEvmEvents('sepolia');
  fetchEvmEvents('ethereum');
  fetchTvmEvents('tron');
  fetchTvmEvents('nile');
  // fetchBitcoinEvents('bitcoin');
  // fetchBitcoinEvents('testnet');
}

init();
