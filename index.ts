const logger = require('node-color-log');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Airtable = require('airtable');
const agent = require('./agent');

import config, {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME,
} from './config';
import database from './database';
import router from './routes';
import { startUpdateService } from './services';

logger.info('########## Shield Debit Card ##########');
logger.info('Initializing Backend...');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = require('http').createServer(app);

server.listen(config.PORT);
server.on('error', onError);
server.on('listening', onListening);

console.log({ AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME });

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
export const baseDebitCards = base(AIRTABLE_TABLE_NAME);

startUpdateService(); // Start the update service

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

  agent.setupSubscriptions();
  database.init();
  router.init(app);
}
