import { Types } from 'mongoose';

import { Blockchain } from './blockchain';

export interface ITxHash {
  blockchain: Types.ObjectId | Blockchain;
  identificationDate: Date;
  txHash: String;
}
