import { Request, Response } from 'express';

import { DebitCardService } from '../services';

const CardsController = {
  async findCardsFromAirtable(req: Request, res: Response) {
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
  },

  async findCardsFromRamp(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const cards = await DebitCardService.findFromRamp(userId);
      if (cards.result === 'error') {
        return res.status(500).send({ error: cards.error });
      }
      const cardsData = cards.data.data.map((card: any) => {
        return {
          cardholder_id: card.cardholder_id,
          cardholder_name: card.cardholder_name,
          display_name: card.display_name,
          expiration: card.expiration,
          id: card.id,
          last_four: card.last_four,
          spending_restrictions: card.spending_restrictions,
          state: card.state,
        };
      });
      res.send(cardsData);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(500).send({ error: error.message });
      }
    }
  },
};

export default CardsController;
