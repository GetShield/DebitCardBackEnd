import { Request, Response } from 'express';

import { DebitCardService } from '../services';

exports.findCard = async function (req: Request, res: Response) {
  try {
    const userId = req.body.user.id;

    const cards = await DebitCardService.find(userId);
    if (cards.result === 'error') {
      return res.status(500).send({ error: cards.error });
    }
    res.send(cards.data);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return res.status(500).send({ error: error.message });
    }
  }
};
