import { Request, Response } from 'express';

import { TransactionsService } from '../services';
import { handleHttpError } from '../utils';
import TransactionModel from '../models/transaction.model';

const TransactionsController = {
  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await TransactionModel.find();

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async getByCurrentUserFromRamp(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const transactions = await TransactionsService.findFromRamp(userId);

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async getNotSyncedByCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const transactions = await TransactionsService.notSynced(userId);

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async syncByCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const transactions = await TransactionsService.syncTransactions(userId);

      if (transactions.numberOfTransactions === 0) {
        return res.send({ message: 'No new transactions found' });
      }

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async syncMockTransactionsByCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;
      const data = req.body.transactions;

      if (!data || !data.length) {
        return res.send({ message: 'No transactions provided' });
      }

      const transactions = await TransactionsService.syncMockTransactions(
        userId,
        data
      );

      if (transactions.numberOfTransactions === 0) {
        return res.send({ message: 'No new transactions found' });
      }

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },
};

export default TransactionsController;
