const logger = require("node-color-log")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const config = require('./config')
const database = require('./database')
const router = require('./routes')

const app = express()

app.use(cors())
app.use(bodyParser.json())

const server = require('http').createServer(app)

server.listen(config.PORT);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
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