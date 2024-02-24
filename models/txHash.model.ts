import mongoose, { Schema, Document } from 'mongoose';

interface ITxHash extends Document {
  txHash: String;
  identificationDate: Date;
  blockchain: Schema.Types.ObjectId;
}

const TxHash = new Schema(
  {
    txHash: { type: String, required: true },
    identificationDate: { type: Date, required: true },
    blockchain: {
      type: Schema.Types.ObjectId,
      ref: 'blockchains',
      required: true,
    },
  },
  {
    collection: 'txHashes',
  }
);

export default mongoose.model<ITxHash>('txHashes', TxHash);
