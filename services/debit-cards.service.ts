import logger from 'node-color-log';
import { baseDebitCards } from '..';
import { Card, NewAirtableUser } from '../types';
import { Result } from '../types';
import { getRampToken } from '../utils';

export class DebitCardService {
  static async create(data: NewAirtableUser): Promise<Result<null, unknown>> {
    try {
      logger.info({ data });
      await baseDebitCards.create(data);

      return { result: 'success', data: null };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }

  static async find(userId: string): Promise<Result<Card[], unknown>> {
    try {
      const records = await baseDebitCards
        .select({
          filterByFormula: `{userId} = "${userId}"`,
        })
        .firstPage();

      const debitCards = records
        .map((record: any) => {
          let fields = record.fields;
          let cards: any[] = [];

          for (let key in fields) {
            if (key.startsWith('card')) {
              cards.push(JSON.parse(fields[key]));
            }
          }

          return cards;
        })
        .flat();

      return { result: 'success', data: debitCards };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }

  static async findFromRamp(userId: string): Promise<Result<any, unknown>> {
    try {
      const records = await baseDebitCards
        .select({
          filterByFormula: `{userId} = "${userId}"`,
        })
        .firstPage();

      const rampUserId = records.map(
        (record: any) => record.fields.rampUserId
      )[0];

      const token = await getRampToken();

      const cardsEndpoint = `${process.env.RAMP_API_URL}/cards?user_id=${rampUserId}`;

      const response = await fetch(cardsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const cards = data;

      return { result: 'success', data: cards };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }
}
