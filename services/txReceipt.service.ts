import logger from 'node-color-log';
import { ClientSession } from 'mongoose';

import { handleError } from '../utils';
import { ITxReceipt } from '../types';
import TxReceiptModel from '../models/txReceipt.model';

export class TxReceiptService {
  static async create(data: ITxReceipt, session: ClientSession): Promise<void> {
    try {
      const txReceipt = await TxReceiptModel.findOne({ txHash: data.txHash });

      if (txReceipt) {
        logger.warn(`TxHash ${data.txHash} already exists as orphaned!`);
        return;
      }

      await TxReceiptModel.create([data], { session });

      logger.info(`TxHash ${data.txHash} saved as orphaned!`);
    } catch (error) {
      handleError(
        error,
        `An error occurred while saving txHash ${data.txHash} as orphaned`
      );
    }
  }
}
