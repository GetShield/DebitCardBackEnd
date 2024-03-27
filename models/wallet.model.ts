import { Schema, model } from 'mongoose';

import { IWallet } from '../types';

const walletSchema: Schema = new Schema<IWallet>(
  {
    address: { type: String, required: true, unique: true },
    blockchains: [{ type: Schema.Types.ObjectId, ref: 'blockchains' }],
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  {
    collection: 'wallets',
    timestamps: true,
  }
);

export default model<IWallet>('wallets', walletSchema);
