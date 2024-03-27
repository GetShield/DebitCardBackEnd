import { Document, Types } from 'mongoose';

import { IWallet } from './wallet';
import { Blockchain } from './blockchain';

export interface Balance extends Document {
  amount: number;
  blockchain: Types.ObjectId | Blockchain;
  currency: string;
  date: Date;
  txHash: string;
  wallet: Types.ObjectId | IWallet;
}

export interface ExchangeRate {
  name: string;
  price: number;
}
