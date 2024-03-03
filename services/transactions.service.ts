import { Result, Transaction, TransactionsResponse } from '../types';
import { getRampToken, getRampUserId } from '../utils';

export class TransactionsService {
  static async find(userId: string): Promise<Transaction[]> {
    try {
      const token = await getRampToken();
      const rampUserId = await getRampUserId(userId);

      const transactionsEndpoint = `${process.env.RAMP_API_URL}/transactions?user_id=${rampUserId}&order_by_date_desc=true`;

      const response = await fetch(transactionsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as TransactionsResponse;
      const transactions = data.data;

      return transactions;
    } catch (error) {
      console.error(`Failed to find transactions:`, error);
      throw error;
    }
  }
}
