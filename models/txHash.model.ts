import { Schema, model } from 'mongoose';

import { ITxHash } from '../types/txHash';

const TxHash = new Schema<ITxHash>(
  {
    blockchain: {
      type: Schema.Types.ObjectId,
      ref: 'blockchains',
      required: true,
    },
    identificationDate: { type: Date, required: true },
    txHash: { type: String, required: true },
  },
  {
    collection: 'txHashes',
    timestamps: true,
  }
);

export default model<ITxHash>('txHashes', TxHash);
