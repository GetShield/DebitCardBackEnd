const logger = require('node-color-log');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Airtable = require('airtable');
const agentv2 = require('./agentv2');
const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = require('./config');

logger.info('########## Shield Debit Card ##########');
logger.info('Initializing Backend...');

import config from './config';
import database from './database';
import router from './routes';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = require('http').createServer(app);

server.listen(config.PORT);
server.on('error', onError);
server.on('listening', onListening);

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
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

  agentv2.setupSubscriptions();
  database.init();
  router.init(app);
}
