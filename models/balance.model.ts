import { Schema, model } from 'mongoose';

import { Balance } from '../types';

const BalanceModel: Schema = new Schema<Balance>(
  {
    amount: { type: Number, required: true },
    blockchain: {
      type: Schema.Types.ObjectId,
      ref: 'blockchains',
      required: true,
    },
    currency: { type: String, required: true },
    date: { type: Date, required: true },
    txHash: { type: String, required: true },
    wallet: { type: Schema.Types.ObjectId, ref: 'wallets', required: true },
  },
  {
    collection: 'balances',
    timestamps: true,
  }
);

export default model<Balance>('balances', BalanceModel);
