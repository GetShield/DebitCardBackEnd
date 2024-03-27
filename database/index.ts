import mongoose from 'mongoose';
import logger from 'node-color-log';

import { MONGOURI } from '../config';

export default {
  init() {
    mongoose
      .connect(MONGOURI, {
        serverSelectionTimeoutMS: 50000, // Increase timeout to 50 seconds
      })
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
  },
};
