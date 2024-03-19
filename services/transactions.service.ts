import { RampTransaction, RampTransactionsResponse } from '../types';
import {
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
} from '../utils';
import { RAMP_API_URL } from '../config';
import TransactionModel, { ITransaction } from '../models/transaction.model';

export class TransactionsService {
  static async findFromRamp(userId: string): Promise<RampTransaction[]> {
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
        `Failed to fetch transactions from ramp for user ${userId}`
      );

      const data = (await response.json()) as RampTransactionsResponse;
      const transactions = data.data;

      return transactions;
    } catch (error) {
      handleError(
        error,
        `Failed to find transactions from ramp for user ${userId}`
      );
    }
  }

  static async notSynced(userId: string): Promise<RampTransaction[]> {
    try {
      const transactions = await TransactionsService.findFromRamp(userId);

      const newTransactions = await TransactionModel.find({
        ramp_transaction_id: { $in: transactions.map((t) => t.id) },
      });

      const notFoundTransactions = transactions.filter(
        (t) => !newTransactions.some((nt) => nt.ramp_transaction_id === t.id)
      );

      return notFoundTransactions;
    } catch (error) {
      handleError(
        error,
        `Failed to find new transactions from ramp for user ${userId}`
      );
    }
  }
}
