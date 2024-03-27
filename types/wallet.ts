import { Types } from 'mongoose';

import { Blockchain } from './blockchain';

export interface IWallet {
  address: String;
  blockchains: Types.ObjectId[] | Blockchain[];
  date: Date;
  user: Types.ObjectId;
}

export interface Price {
  name: string;
  price: number;
}
