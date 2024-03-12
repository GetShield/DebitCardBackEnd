import { Request, Response } from 'express';
import TxReceipt from '../models/txReceipt.model';
import BlockchainModel from '../models/blockchain.model';
import logger from 'node-color-log';
import BalanceController from '../controllers/balance.controller';
import { ethers } from 'ethers';

const WebhookController = {
  async processWebhook(req: Request, res: Response) {
    try {
      const txReceipt = req.body;
      const blockchain = await BlockchainModel.findOne({
        chain: txReceipt.chain,
      });

      let receipt = await TxReceipt.create({
        txHash: txReceipt.txId,
        from: txReceipt.address,
        to: txReceipt.counterAddress,
        blockchain: blockchain!.id,
        amount: txReceipt.amount,
        identificationDate: new Date(),
      });

      logger.info(`New TxReceipt created: ${receipt}`);

      let balanceData = {
        chain: txReceipt.chain,
        amount: Number(ethers.formatEther(txReceipt.amount)),
        from: txReceipt.address,
        to: txReceipt.counterAddress,
        blockNumber: txReceipt.blockNumber,
        txHash: txReceipt.txId,
        currency: txReceipt.currency,
      };

      await BalanceController.updateInside(balanceData);

      res.status(200);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send({ message: error.message });
      }
    }
  },
};

export default WebhookController;
