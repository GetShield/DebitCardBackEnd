import { Request, Response } from 'express';

import { TransactionsService } from '../services';

const TransactionsController = {
  async findTransactions(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const transactions = await TransactionsService.find(userId);

      res.send(transactions);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(500).send({ error: error.message });
      }
    }
  },
};

export default TransactionsController;
