import { Types } from 'mongoose';

import { IBlockchain } from './blockchain';

export interface ITxReceipt {
  amount: string;
  blockchain: Types.ObjectId | IBlockchain;
  blockNumber: number;
  exchangeRate: number;
  from: string;
  identificationDate: Date;
  to: string;
  txHash: string;
  usdValue: number;
}
