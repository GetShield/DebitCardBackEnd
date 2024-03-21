import { Types } from 'mongoose';

import { IBlockchain } from './blockchain';

export interface ITxHash {
  blockchain: Types.ObjectId | IBlockchain;
  identificationDate: Date;
  txHash: String;
}
