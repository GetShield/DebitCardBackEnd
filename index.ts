const logger = require('node-color-log');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Airtable = require('airtable');
require('dotenv').config();

import config from './config';
import database from './database';
import router from './routes';

// import { fetchEthereumEvents } from "./agent/ethereum-tracker";
import { fetchEvmEvents } from './agent/evm-tracker';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = require('http').createServer(app);

server.listen(config.PORT);
server.on('error', onError);
server.on('listening', onListening);

fetchEvmEvents('sepolia');
fetchEvmEvents('ethereum');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);
export const baseDebitCards = base('Debit Cards');

function onError(error: any) {
  if (error.syscall != 'listen') {
    throw error;
  }
  var bind = 'Port ' + config.PORT;

  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  logger.info('Listening on port: ' + config.PORT);

  database.init();
  router.init(app);
}
