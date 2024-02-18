import { baseDebitCards } from '..';
import { Card } from '../types';
import { Result } from '../types';

export class DebitCardService {
  static async create(
    data: Card
  ): Promise<Result<{ recordId: string }, unknown>> {
    try {
      const debitCard = await baseDebitCards.create(data);
      const recordId = debitCard.getId();

      return { result: 'success', data: recordId };
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
      const debitCards = records.map((record: any) => record.fields);

      return { result: 'success', data: debitCards };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }
}
