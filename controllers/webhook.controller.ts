import { ethers } from 'ethers';
import { Request, Response } from 'express';
import logger from 'node-color-log';
import mongoose from 'mongoose';

import TxReceipt from '../models/txReceipt.model';
import {
  getExchangeRate,
  getRampUserId,
  handleHttpError,
  getTransactionById,
} from '../utils';
import { LimitsService } from '../services/limits.service';
import BlockchainModel from '../models/blockchain.model';
import { OnchainReceipt, TxData } from '../types';
import { BalanceService } from '../services';

const WebhookController = {
  async processWebhook(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const txReceipt = req.body;
      const blockchain = await BlockchainModel.findOne({
        chain: txReceipt.chain,
      });

      let exchangeRate = Number((await getExchangeRate('ETH'))?.price);
      let usdValue = exchangeRate * Number(txReceipt.amount);

      let from = txReceipt.counterAddress;

      if (txReceipt.currency === 'BTC' && !txReceipt.counterAddress) {
        let result = (await getTransactionById(
          req.body.txId
        )) as OnchainReceipt;
        from = result.data.item.senders[0].address;
      }

      let receipt = await TxReceipt.create({
        txHash: txReceipt.txId,
        from,
        to: txReceipt.address,
        blockchain: blockchain!.id,
        amount: txReceipt.amount,
        blockNumber: txReceipt.blockNumber,
        identificationDate: new Date(),
        exchangeRate,
        usdValue,
      });

      logger.info(`New TxReceipt created: ${receipt}`);

      let balanceData: TxData = {
        chain: txReceipt.chain,
        amount: ethers.formatEther(ethers.parseEther(txReceipt.amount)),
        from,
        to: txReceipt.address,
        blockNumber: txReceipt.blockNumber,
        txHash: txReceipt.txId,
        currency: txReceipt.currency,
      };

      const result = await BalanceService.updateInside(balanceData, session);
      const userId = result.userId;

      const rampUserId = await getRampUserId(userId);

      const totalUserUSDBalance = await BalanceService.getTotalUSDUserBalance(
        userId,
        session
      );

      await LimitsService.updateUserSpendLimits(
        rampUserId,
        totalUserUSDBalance
      );

      logger.info(`User spend limits updated for user: ${rampUserId}`);

      await session.commitTransaction();

      res.status(200).send();
    } catch (error) {
      await session.abortTransaction();
      handleHttpError(error, res);
    } finally {
      session.endSession();
    }
  },
};

export default WebhookController;
