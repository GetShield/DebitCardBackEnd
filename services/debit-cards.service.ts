import { baseDebitCards } from '..';
import { Card, NewAirtableUser } from '../types';
import { Result } from '../types';

export class DebitCardService {
  static async create(data: NewAirtableUser): Promise<Result<null, unknown>> {
    try {
      console.log({ data });
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
}
