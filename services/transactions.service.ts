import { baseDebitCards } from '..';
import { Result, Transaction } from '../types';
import { getRampToken } from '../utils';
import { RAMP_API_URL } from '../config';

export class TransactionsService {
  static async find(userId: string): Promise<Result<any, unknown>> {
    try {
      const token = await getRampToken();

      // Transactions
      const records = await baseDebitCards
        .select({
          filterByFormula: `{userId} = "${userId}"`,
        })
        .firstPage();

      const rampUserId = records.map(
        (record: any) => record.fields.rampUserId
      )[0];

      const transactionsEndpoint = `${RAMP_API_URL}/transactions?user_id=${rampUserId}&order_by_date_desc=true`;

      const response = await fetch(transactionsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const transactions = data;

      return { result: 'success', data: transactions };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }
}
