import mongoose, { Schema, Document } from 'mongoose';

interface ITxReceipt extends Document {
  txHash: String;
  identificationDate: Date;
  blockchain: Schema.Types.ObjectId;
  blockNumber: Number;
  exchangeRate: Number;
  usdValue: Number;
}

const TxReceipt = new Schema(
  {
    blockNumber: { type: Number, required: true },
    txHash: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: String, required: true },
    exchangeRate: { type: Number, required: true },
    usdValue: { type: Number, required: true },
    identificationDate: { type: Date, required: true },
    blockchain: {
      type: Schema.Types.ObjectId,
      ref: 'blockchains',
      required: true,
    },
  },
  {
    collection: 'txReceipts',
  }
);

export default mongoose.model<ITxReceipt>('txReceipts', TxReceipt);
