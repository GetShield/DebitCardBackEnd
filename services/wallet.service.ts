import { Price } from '../types';
import { getAllExchangeRates, handleError } from '../utils';
import Wallet from '../models/wallet.model';

export class WalletService {
  static async getPrices(): Promise<Price[]> {
    try {
      const priceArr = await getAllExchangeRates();

      return priceArr;
    } catch (error) {
      handleError(error, `Failed to get prices`);
    }
  }

  static async getUserWallets(userId: string) {
    try {
      const wallets = await Wallet.find({ user: userId }).populate(
        'blockchains'
      );

      if (!wallets) {
        throw new Error(`No wallets found for user ${userId}`);
      }

      return wallets;
    } catch (error) {
      handleError(error, `Failed to get user wallets`);
    }
  }
}
