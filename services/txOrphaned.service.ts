import logger from 'node-color-log';

import TxOrphanedModel from '../models/txOrphaned.model';
import { TxOrphaned } from '../types';
import { handleError } from '../utils';

export class TxOrphanedService {
  static async create(data: TxOrphaned): Promise<void> {
    try {
      const txOrphaned = await TxOrphanedModel.findOne({ txHash: data.txHash });

      if (txOrphaned) {
        logger.warn(`TxHash ${data.txHash} already exists as orphaned!`);
        return;
      }

      await TxOrphanedModel.create(data);

      logger.info(`TxHash ${data.txHash} saved as orphaned!`);
    } catch (error) {
      handleError(
        error,
        `An error occurred while saving txHash ${data.txHash} as orphaned`
      );
    }
  }
}
