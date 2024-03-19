import { Request, Response } from 'express';
import TxReceipt from '../models/txReceipt.model';
import BlockchainModel from '../models/blockchain.model';
import logger from 'node-color-log';
import BalanceController from '../controllers/balance.controller';
import { ethers } from 'ethers';
import { getExchangeRate, getRampUserId } from '../utils';
import { LimitsService } from '../services/limits.service';
import mongoose from 'mongoose';
import { Balance } from '../types';

const WebhookController = {
  async processWebhook(req: Request, res: Response) {
    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const txReceipt = req.body;
      const blockchain = await BlockchainModel.findOne({
        chain: txReceipt.chain,
      });

      let exchangeRate = Number((await getExchangeRate('ETH'))?.price);
      let usdValue = exchangeRate * Number(txReceipt.amount);

      let receipt = await TxReceipt.create({
        txHash: txReceipt.txId,
        from: txReceipt.counterAddress,
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

      const result = (await BalanceController.updateInside(
        balanceData
      )) as Balance;

      await session.commitTransaction();
      session.endSession();

      let rampUserId = await getRampUserId(result.userId.toString());

      const updateLimitRes = await LimitsService.updateUserSpendLimits(
        rampUserId,
        usdValue
      );

      console.log('updateLimitRes: ', updateLimitRes);

      res.status(200).send();
    } catch (error) {
      if (error instanceof Error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).send({ message: error.message });
      }
    }
  },
};

export default WebhookController;
