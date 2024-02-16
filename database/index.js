const mongoose = require('mongoose')
const logger = require('node-color-log')

const config = require('../config')

exports.init = function () {
    mongoose.connect(config.MONGOURI)
      .then(() => {
        logger.info("MongoDB database connection established successfully");
      })
      .catch(err => {
        logger.error("MongoDB database connection established unsuccessfully", err);
        process.exit(0);
      })
}