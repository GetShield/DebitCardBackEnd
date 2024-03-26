import logger from 'node-color-log';
import { ethers } from 'ethers';
import mongoose from 'mongoose';

import TxOrphanedModel from '../models/txOrphaned.model';
import { Blockchain, TxData, TxOrphaned } from '../types';
import { getExchangeRate, getRampUserId, handleError } from '../utils';
import txReceiptModel from '../models/txReceipt.model';
import { LimitsService } from './limits.service';
import { BalanceService } from './balance.service';

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

  static async getTxOrphaned(): Promise<TxOrphaned[]> {
    try {
      return await TxOrphanedModel.find();
    } catch (error) {
      handleError(error, 'An error occurred while fetching txOrphaned');
    }
  }

  static async reassignTx(txHash: string, fromAddress: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const txOrphaned = await TxOrphanedModel.findOne({ txHash });

      if (!txOrphaned) {
        throw new Error(`TxOrphaned ${txHash} not found`);
      }

      await txReceiptModel.updateOne(
        { txHash },
        { $set: { from: fromAddress } },
        { session }
      );

      await TxOrphanedModel.deleteOne({ txHash }, { session });

      const txReceipt = await txReceiptModel
        .findOne({ txHash })
        .populate('blockchain');

      if (!txReceipt) {
        throw new Error(`TxReceipt ${txHash} not found`);
      }

      let exchangeRate = Number((await getExchangeRate('ETH'))?.price);
      let usdValue = exchangeRate * Number(txReceipt.amount);
      const blockchain = txReceipt.blockchain as Blockchain;

      const balanceData: TxData = {
        chain: blockchain.chain,
        amount: ethers.formatEther(ethers.parseEther(txReceipt.amount)),
        from: fromAddress,
        to: txReceipt.to,
        blockNumber: txReceipt.blockNumber,
        txHash: txReceipt.txHash,
        currency: blockchain.nativeSymbol,
      };

      const result = await BalanceService.updateInside(balanceData, session);

      let rampUserId = await getRampUserId(result.userId);

      await LimitsService.updateUserSpendLimits(rampUserId, usdValue);

      await session.commitTransaction();

      logger.info(`Tx ${txHash} reassigned successfully to ${fromAddress}!`);
    } catch (error) {
      await session.abortTransaction();
      handleError(
        error,
        `An error occurred while updating from address for txHash ${txHash}`
      );
    } finally {
      session.endSession();
    }
  }
}
