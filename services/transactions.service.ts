import mongoose from 'mongoose';
import logger from 'node-color-log';

import {
  Balance,
  CryptoDeduction,
  ExchangeRate,
  RampTransaction,
  RampTransactionsResponse,
  SyncTransactionsResponse,
  Transaction,
  UserId,
} from '../types';
import {
  getHistoricPrice,
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
  getAllExchangeRates,
  buildSyncResponse,
} from '../utils';
import { RAMP_API_URL, Token } from '../config';
import TransactionModel from '../models/transaction.model';
import BalanceModel from '../models/balance.model';
import { BalanceService } from './balance.service';

export class TransactionsService {
  static async findFromRamp(userId: UserId): Promise<RampTransaction[]> {
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

  static async notSynced(userId: UserId): Promise<RampTransaction[]> {
    try {
      const transactions = await this.findFromRamp(userId);

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

  static async updateUserBalances(
    rampTransaction: RampTransaction,
    userId: UserId,
    exchangeRates: ExchangeRate[],
    session: mongoose.ClientSession
  ): Promise<CryptoDeduction[]> {
    try {
      const userBalances = await BalanceService.getBalancesByUserId(userId);

      const cryptoDeductions: CryptoDeduction[] = [];
      let amountToDecreaseInUSD = rampTransaction.amount;

      for (const _balance of userBalances) {
        if (amountToDecreaseInUSD <= 0) {
          break;
        }

        const userBalances = await BalanceService.getBalancesAndUSD(
          userId,
          exchangeRates
        );

        const { balance: higherBalance } = userBalances.reduce(
          (acc, balance) => {
            if (balance.usdEquivalent > acc.usdEquivalent) {
              return balance;
            }
            return acc;
          }
        );

        const exchangeRate = await getHistoricPrice(
          higherBalance.currency,
          rampTransaction.user_transaction_time
        );

        if (!exchangeRate) {
          throw new Error(
            `Failed to get exchange rate for ${higherBalance.currency} at ${rampTransaction.user_transaction_time}`
          );
        }

        const cryptoToDecrease = rampTransaction.amount / exchangeRate;

        const cryptoDeduction: CryptoDeduction = {
          amount: cryptoToDecrease,
          balance: higherBalance._id,
          exchangeRate: exchangeRate,
          ticker: higherBalance.currency,
          usdValue: cryptoToDecrease * exchangeRate,
        };

        cryptoDeductions.push(cryptoDeduction);
        amountToDecreaseInUSD -= cryptoDeduction.usdValue;

        await BalanceModel.findOneAndUpdate(
          { _id: higherBalance._id },
          { $inc: { amount: -cryptoToDecrease } },
          { session }
        );
      }

      if (cryptoDeductions.length === 0) {
        throw new Error('No balances were updated');
      }

      return cryptoDeductions;
    } catch (error) {
      handleError(
        error,
        `Failed to update user balances for user ${userId} and transaction ${rampTransaction.id}`
      );
    }
  }

  // Here we insert the transaction in the db and we decrease the user balance
  static async insertTransaction(
    rampTransaction: RampTransaction,
    exchangeRates: ExchangeRate[],
    userId: UserId
  ): Promise<Transaction> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const existingTransaction = await TransactionModel.findOne({
        ramp_transaction_id: rampTransaction.id,
      });

      if (existingTransaction) {
        throw new Error(
          `Transaction with rampId: ${rampTransaction.id} already exists`
        );
      }

      const cryptoDeductions = await this.updateUserBalances(
        rampTransaction,
        userId,
        exchangeRates,
        session
      );

      const transaction: Transaction = {
        ramp_amount: rampTransaction.amount,
        ramp_currency_code: rampTransaction.currency_code,
        ramp_transaction_id: rampTransaction.id,
        ramp_user_transaction_time: rampTransaction.user_transaction_time,
        user: userId,
        crypto_deductions: cryptoDeductions,
      };

      const newTransaction = await TransactionModel.create([transaction], {
        session,
      });

      await session.commitTransaction();

      logger.info(
        `Transaction of rampId: ${rampTransaction.id} synced successfully`
      );

      return newTransaction[0];
    } catch (error) {
      session.abortTransaction();
      handleError(
        error,
        `Failed to insert transaction of rampId: ${rampTransaction.id}`
      );
    } finally {
      session.endSession();
    }
  }

  static async syncTransactions(
    userId: UserId
  ): Promise<SyncTransactionsResponse> {
    try {
      const notSyncedTransactions = await this.notSynced(userId);
      const exchangeRates = await getAllExchangeRates();

      const savedTransactions: Transaction[] = [];

      for (const t of notSyncedTransactions) {
        const savedTransaction = await this.insertTransaction(
          t,
          exchangeRates,
          userId
        );
        savedTransactions.push(savedTransaction);
      }

      const response = buildSyncResponse(
        savedTransactions,
        notSyncedTransactions
      );
      return response;
    } catch (error) {
      handleError(
        error,
        `Failed to sync transactions from ramp for user ${userId}`
      );
    }
  }

  static async syncMockTransactions(
    userId: UserId,
    rampTransactions: RampTransaction[]
  ): Promise<SyncTransactionsResponse> {
    try {
      const exchangeRates = await getAllExchangeRates();

      const savedTransactions: Transaction[] = [];

      for (const t of rampTransactions) {
        const savedTransaction = await this.insertTransaction(
          t,
          exchangeRates,
          userId
        );
        savedTransactions.push(savedTransaction);
      }

      const response = buildSyncResponse(savedTransactions, rampTransactions);
      return response;
    } catch (error) {
      handleError(
        error,
        `Failed to sync mock transactions from ramp for user ${userId}`
      );
    }
  }
}
