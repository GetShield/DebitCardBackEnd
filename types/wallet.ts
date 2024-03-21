import { Types } from 'mongoose';

import { IBlockchain } from './blockchain';

export interface IWallet {
  address: String;
  blockchains: Types.ObjectId[] | IBlockchain[];
  date: Date;
  user: Types.ObjectId;
}

export interface Price {
  name: string;
  price: number;
}
