import balanceModel from '../models/balance.model';
import walletModel from '../models/wallet.model';
import { Balance, Price, UserId } from '../types';
import { handleError } from '../utils';

export class BalanceService {
  static async getBalancesByUserId(userId: UserId): Promise<Balance[]> {
    try {
      // Find wallets for the user
      const wallets = await walletModel.find({ user: userId });

      // Extract wallet ids
      const walletIds = wallets.map((wallet) => wallet._id);

      // Find balances for the wallets
      const balances = await balanceModel
        .find({ wallet: { $in: walletIds } })
        .populate('wallet')
        .populate('blockchain');

      return balances as any as Balance[];
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
