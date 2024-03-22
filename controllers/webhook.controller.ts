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
import BalanceController from '../controllers/balance.controller';
import BlockchainModel from '../models/blockchain.model';
import { OnchainReceipt } from '../types';

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

      let balanceData = {
        chain: txReceipt.chain,
        amount: ethers.formatEther(ethers.parseEther(txReceipt.amount)),
        from: txReceipt.counterAddress,
        to: txReceipt.address,
        blockNumber: txReceipt.blockNumber,
        txHash: txReceipt.txId,
        currency: txReceipt.currency,
      };

      const result = await BalanceController.updateInside(balanceData);

      let rampUserId = await getRampUserId(result.userId);

      const updateLimitRes = await LimitsService.updateUserSpendLimits(
        rampUserId,
        usdValue
      );

      console.log('updateLimitRes: ', updateLimitRes);
      await session.commitTransaction();

      res.status(200).send();
    } catch (error) {
      if (error instanceof Error) {
        await session.abortTransaction();
        session.endSession();
        handleHttpError(error, res);
      }
    } finally {
      session.endSession();
    }
  },
};

export default WebhookController;
