import { Request, Response } from 'express';

import { TransactionsService } from '../services';
import { handleHttpError } from '../utils';

const TransactionsController = {
  async findTransactions(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const transactions = await TransactionsService.find(userId);

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },
};

export default TransactionsController;
