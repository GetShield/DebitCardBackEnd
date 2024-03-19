import { Request, Response } from 'express';

import { DebitCardService } from '../services';
import { handleHttpError } from '../utils';
import { RampCard } from '../types';

const CardsController = {
  async findCardsFromAirtable(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const cards = await DebitCardService.find(userId);

      res.send(cards);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async findCardsFromRamp(req: Request, res: Response) {
    try {
      const userId = req.body.user.id;

      const cards = await DebitCardService.findFromRamp(userId);

      const cardsData = cards.map((card: RampCard) => {
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
      handleHttpError(error, res);
    }
  },
};

export default CardsController;
