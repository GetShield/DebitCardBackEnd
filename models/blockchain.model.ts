import { Schema, model } from 'mongoose';

import { Blockchain } from '../types';

const Blockchain = new Schema<Blockchain>(
  {
    chain: { type: String, required: true, unique: true },
    chainId: { type: Number, required: false },
    chainType: { type: String, required: true },
    mainnet: { type: Boolean, required: true },
    native_symbol: { type: String, required: true },
    wallets: [{ type: Schema.Types.ObjectId, ref: 'wallets' }],
  },
  {
    collection: 'blockchains',
    timestamps: true,
  }
);

export default model<Blockchain>('blockchains', Blockchain);
