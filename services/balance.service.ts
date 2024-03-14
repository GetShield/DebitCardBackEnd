import balanceModel from '../models/balance.model';
import walletModel from '../models/wallet.model';
import { Balance, Price } from '../types';

export class BalanceService {
  static async getBalancesByUserId(userId: string): Promise<Balance[]> {
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
      console.error(`Failed to get balances for user ${userId}:`, error);
      throw error;
    }
  }

  static async getTotalBalanceInUSD(userId: string, prices: Price[]) {
    try {
      const balances = await this.getBalancesByUserId(userId);

      return balances.reduce((acc, balance) => {
        const { price = 0 } =
          prices.find((price) => price.name === balance.crypto) || {};
        return acc + balance.amount * price;
      }, 0);
    } catch (error) {
      console.error(
        `Failed to get total balance in USD for user ${userId}:`,
        error
      );
      throw error;
    }
  }
}

// At the moment of the sync:

// lastBalance: {
//  eth: 100
//  btc: 0.2
//  tron: 1000
// }
// totalLastBalance: 100000 (cents)
// lastSpent: 100
// lastLimit: 200

// balance: {
//  eth: 105
//  btc: 0.22
//  tron: 860
// }
// totalBalance: 105000 (cents)
// spent: 200
// limit: 200
