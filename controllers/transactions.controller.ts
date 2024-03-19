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

  async syncWithRamp(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const transactions = await TransactionsService.findFromRamp(userId);

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },
};

export default TransactionsController;
