import mongoose from 'mongoose';

import {
  Balance,
  Blockchain,
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
  getExchangeRate,
  getAllExchangeRates,
} from '../utils';
import { CURRENCY, RAMP_API_URL, Token } from '../config';
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

      const balancesAndUSD = await BalanceService.getBalancesAndUSD(
        userId,
        exchangeRates
      );

      const cryptoDeductions: CryptoDeduction[] = [];
      let amountToDecreaseInUSD = rampTransaction.amount;
      let newBalances = balancesAndUSD;

      console.log({ amountToDecreaseInUSD });

      for (const _balance of newBalances) {
        if (amountToDecreaseInUSD <= 0) {
          break;
        }

        const { balance: higherBalance } = newBalances.reduce(
          (acc, balance) => {
            if (balance.usdEquivalent > acc.usdEquivalent) {
              return balance;
            }
            return acc;
          }
        );

        const { price: exchangeRate } = await getExchangeRate(
          higherBalance.currency
        );

        const cryptoToDecrease = rampTransaction.amount / exchangeRate;

        const cryptoDeduction: CryptoDeduction = {
          amount: cryptoToDecrease,
          balance: higherBalance._id,
          exchangeRate: exchangeRate,
          ticker: higherBalance.currency,
          usdValue: cryptoToDecrease * exchangeRate,
        };

        console.log({ cryptoDeduction });

        cryptoDeductions.push(cryptoDeduction);
        amountToDecreaseInUSD -= cryptoDeduction.usdValue;
        newBalances = newBalances.filter(
          (balance) => balance.balance._id !== higherBalance._id
        );

        const balanceUpdated = await BalanceModel.findOneAndUpdate(
          { _id: higherBalance._id },
          { $inc: { amount: -cryptoToDecrease } },
          { session }
        );

        console.log({ balanceUpdated });
      }

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

      console.log({ newTransaction });

      await session.commitTransaction();
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const notSyncedTransactions = await TransactionsService.notSynced(userId);

      const exchangeRates = await getAllExchangeRates();

      const savedTransactions = [];

      for (const t of notSyncedTransactions) {
        const savedTransaction = await TransactionsService.insertTransaction(
          t,
          exchangeRates,
          userId
        );
        savedTransactions.push(savedTransaction);
      }

      const totalUSD = savedTransactions.reduce((acc, t) => {
        return (
          acc + t.crypto_deductions.reduce((acc, cd) => acc + cd.usdValue, 0)
        );
      }, 0);

      const totalRampUSD = notSyncedTransactions.reduce(
        (acc, t) => acc + t.amount,
        0
      );

      await session.commitTransaction();

      return {
        numberOfTransactions: savedTransactions.length,
        transactionsTotalUSD: totalUSD,
        rampTotalUSD: totalRampUSD,
        transactions: savedTransactions,
      };
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

  static async syncMockTransactions(
    userId: UserId,
    rampTransactions: RampTransaction[]
  ): Promise<SyncTransactionsResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const exchangeRates = await getAllExchangeRates();

      const savedTransactions: Transaction[] = [];

      for (const t of rampTransactions) {
        const savedTransaction = await TransactionsService.insertTransaction(
          t,
          exchangeRates,
          userId
        );
        savedTransactions.push(savedTransaction);
      }

      const totalUSD = savedTransactions.reduce((acc, t) => {
        return (
          acc + t.crypto_deductions.reduce((acc, cd) => acc + cd.usdValue, 0)
        );
      }, 0);

      const totalRampUSD = rampTransactions.reduce(
        (acc, t) => acc + t.amount,
        0
      );

      await session.commitTransaction();

      return {
        numberOfTransactions: savedTransactions.length,
        transactionsTotalUSD: totalUSD,
        rampTotalUSD: totalRampUSD,
        transactions: savedTransactions,
      };
    } catch (error) {
      await session.abortTransaction();
      handleError(
        error,
        `Failed to sync mock transactions from ramp for user ${userId}`
      );
    } finally {
      session.endSession();
    }
  }
}
