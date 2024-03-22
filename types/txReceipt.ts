import { Types } from 'mongoose';

import { Blockchain } from './blockchain';

export interface ITxReceipt {
  amount: string;
  blockchain: Types.ObjectId | Blockchain;
  blockNumber: number;
  exchangeRate: number;
  from: string;
  identificationDate: Date;
  to: string;
  txHash: string;
  usdValue: number;
}
