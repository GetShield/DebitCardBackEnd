import { Document, Types } from 'mongoose';

import { IWallet } from './wallet';

export interface Blockchain extends Document {
  chain: string;
  chainId: number;
  chainType: string;
  mainnet: boolean;
  nativeSymbol: string;
  wallets: Types.ObjectId[] | IWallet[];
}
