import { Request, Response } from 'express';

import { TransactionsService } from '../services';

exports.findTransactions = async function (req: Request, res: Response) {
  try {
    const userId = req.body.user.id;

    const transactions = await TransactionsService.find(userId);

    if (transactions.result === 'error') {
      return res.status(500).send({ error: transactions.error });
    }
    res.send(transactions.data);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return res.status(500).send({ error: error.message });
    }
  }
};
