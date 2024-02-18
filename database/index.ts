import mongoose from 'mongoose';
import logger from 'node-color-log';

import config from '../config';

export const init = function () {
  mongoose
    .connect(config.MONGOURI)
    .then(() => {
      logger.info('MongoDB database connection established successfully');
    })
    .catch((err: Error) => {
      logger.error(
        'MongoDB database connection established unsuccessfully',
        err
      );
      process.exit(0);
    });
};
