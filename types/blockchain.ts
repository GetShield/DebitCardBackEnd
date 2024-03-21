import { Types } from 'mongoose';

import { IWallet } from './wallet';

export interface IBlockchain {
  chain: String;
  chainId: Number;
  chainType: String;
  mainnet: Boolean;
  native_symbol: String;
  wallets: Types.ObjectId[] | IWallet[];
}
