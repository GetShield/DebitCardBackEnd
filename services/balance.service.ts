import balanceModel from '../models/balance.model';
import walletModel from '../models/wallet.model';
import { Balance, Price, UserId } from '../types';
import { handleError } from '../utils';

export class BalanceService {
  static async getBalancesByUserId(userId: UserId): Promise<Balance[]> {
    try {
      const wallets = await walletModel.find({ user: userId });

      const walletIds = wallets.map((wallet) => wallet._id);

      const balances: Balance[] = await balanceModel
        .find({ wallet: { $in: walletIds } })
        .populate('wallet')
        .populate('blockchain');

      return balances;
    } catch (error) {
      handleError(error, `Failed to get balances for user ${userId}`);
    }
  }

  static async getBalancesAndUSD(userId: UserId, prices: Price[]) {
    try {
      const balances = await this.getBalancesByUserId(userId);

      const balancesWithUSDEquivalents = balances.map((balance) => {
        const { price = 0 } =
          prices.find((price) => price.name === balance.currency) || {};

        return {
          balance,
          usdEquivalent: balance.amount * price,
        };
      });

      if (balancesWithUSDEquivalents.length < 1) {
        throw new Error(`No balances found for user ${userId}`);
      }

      return balancesWithUSDEquivalents;
    } catch (error) {
      handleError(
        error,
        `Failed to get balances and USD equivalents for user ${userId}`
      );
    }
  }

  static async getTotalBalanceInUSD(userId: UserId, prices: Price[]) {
    try {
      const balances = await this.getBalancesByUserId(userId);

      const totalBalance = balances.reduce((acc, balance) => {
        const { price = 0 } =
          prices.find((price) => price.name === balance.currency) || {};
        return acc + balance.amount * price;
      }, 0);

      return totalBalance;
    } catch (error) {
      handleError(
        error,
        `Failed to get total balance in USD for user ${userId}`
      );
    }
  }

  // Same as above but with balances as a param
  static getTotalUSDBalance(
    userId: UserId,
    prices: Price[],
    balances: Balance[]
  ) {
    try {
      const totalBalance = balances.reduce((acc, balance) => {
        const { price = 0 } =
          prices.find((price) => price.name === balance.currency) || {};
        return acc + balance.amount * price;
      }, 0);

      return totalBalance;
    } catch (error) {
      handleError(
        error,
        `Failed to get total balance in USD for user ${userId}`
      );
    }
  }
}
