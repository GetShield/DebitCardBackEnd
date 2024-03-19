import { Transaction, TransactionsResponse } from '../types';
import {
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
} from '../utils';
import { RAMP_API_URL } from '../config';

export class TransactionsService {
  static async find(userId: string): Promise<Transaction[]> {
    try {
      const token = await getRampToken();
      const rampUserId = await getRampUserId(userId);

      const transactionsEndpoint = `${RAMP_API_URL}/transactions?user_id=${rampUserId}&order_by_date_desc=true`;

      const response = await fetch(transactionsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(
        response,
        `Failed to find transactions from ramp for user ${userId}`
      );

      const data = (await response.json()) as TransactionsResponse;
      const transactions = data.data;

      return transactions;
    } catch (error) {
      handleError(error, `Failed to find transactions for user ${userId}`);
    }
  }
}
