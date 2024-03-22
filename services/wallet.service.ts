import config from '../config';
import { Price } from '../types';
import { handleError } from '../utils';
import Wallet from '../models/wallet.model';

const CoinMarketCap = require('coinmarketcap-api');
const client = new CoinMarketCap(config.CMC_API_KEY);

export class WalletService {
  static async getPrices(): Promise<Price[]> {
    try {
      const quotes = await client.getQuotes({ symbol: config.TOKENS });

      const priceArr = config.TOKENS.map((tokenName: string, index: number) => {
        const price = quotes.data[tokenName].quote.USD.price;
        return { name: tokenName, price: price };
      });

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
