import { Types } from 'mongoose';

import { IWallet } from './wallet';
import { IBlockchain } from './blockchain';

export interface Balance {
  amount: number;
  blockchain: Types.ObjectId | IBlockchain;
  currency: string;
  date: Date;
  txHash: string;
  wallet: Types.ObjectId | IWallet;
}
