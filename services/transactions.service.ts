import mongoose, { ObjectId } from 'mongoose';

import { RampTransaction, RampTransactionsResponse } from '../types';
import {
  getHistoricPrice,
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
} from '../utils';
import { RAMP_API_URL, Token } from '../config';
import TransactionModel, { Transaction } from '../models/transaction.model';
import { BalanceService } from './balance.service';

export class TransactionsService {
  static async findFromRamp(userId: ObjectId): Promise<RampTransaction[]> {
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

  static async notSynced(userId: ObjectId): Promise<RampTransaction[]> {
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

  static async syncTransactions(userId: ObjectId): Promise<Transaction[]> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ! We get the user balances from the db
      const balances = BalanceService.getBalancesByUserId(userId);

      // ! We decide what crypto to decrease from the user balances

      // ! We get the transactions for the user that are not in our db (that are not synced yet, so they are new transactions)
      const notSyncedTransactions = await TransactionsService.notSynced(userId);

      const newTransactions = notSyncedTransactions.map((t) => {
        return {
          ramp_amount: t.amount,
          ramp_currency_code: t.currency_code,
          ramp_transaction_id: t.id,
          ramp_user_transaction_time: t.user_transaction_time,
          user: userId,
          // with the new stuffs
        };
      });

      // TODO: Update the user balance
      // ! We need to update the user crypto balance for the exact amount of the transactions in the exact ramp_user_transaction_time
      const token: Token = 'ETH'; // ! We need to get the token that the user has in his wallet
      const transactionsInCrypto = await Promise.all(
        newTransactions.map(async (t) => {
          const price = await getHistoricPrice(
            token,
            String(t.ramp_user_transaction_time)
          );
          return {
            token,
            date: t.ramp_user_transaction_time,
            price,
          };
        })
      );

      // pass session whe updating the user balances.

      // ! We save the new transactions in our db
      const savedTransactions = await TransactionModel.insertMany(
        newTransactions,
        {
          session,
        }
      );

      console.log({ transactionsInCrypto });

      await session.commitTransaction();

      return savedTransactions;
    } catch (error) {
      await session.abortTransaction();
      handleError(
        error,
        `Failed to sync transactions from ramp for user ${userId}`
      );
    } finally {
      session.endSession();
    }
  }
}
