import { Request, Response } from 'express';

import Transaction from '../models/blockchainTransaction.model';
const BlockchainTransactionController = {


  async getTransactionById (req: Request, res: Response) {
    if (req.params.tx_id === undefined) {
      res.status(400).send({ message: 'Transaction hash is empty!' });
      return;
    }

    try {
      const transaction = await Transaction.findOne({ tx_id: req.params.tx_id });

      res.send({ transaction });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },


  async getTransactionByWallet (req: Request, res: Response) {
    if (req.params.wallet_address === undefined) {
      res.status(400).send({ message: 'Wallet address is empty!' });
      return;
    }

    try {
      const transaction = await Transaction.findOne({ tx_id: req.params.tx_id });

      res.send({ transaction });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  }
  
};

export default BlockchainTransactionController;