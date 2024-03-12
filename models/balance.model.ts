import mongoose, { Schema, Document } from 'mongoose';

interface IBalance extends Document {
  date: Date;
  amount: Number;
  currency: String;
  txHash: String;
  wallet: Schema.Types.ObjectId;
  blockchain: Schema.Types.ObjectId;
}

const BalanceSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    txHash: { type: String, required: true },
    wallet: { type: Schema.Types.ObjectId, ref: 'wallets', required: true },
    blockchain: {
      type: Schema.Types.ObjectId,
      ref: 'blockchains',
      required: true,
    },
  },
  {
    collection: 'balances',
  }
);

export default mongoose.model<IBalance>('balances', BalanceSchema);
