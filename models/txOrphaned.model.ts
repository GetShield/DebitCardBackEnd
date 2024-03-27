import mongoose, { Schema } from 'mongoose';

import { TxOrphaned } from '../types';

const TxOrphanedSchema: Schema = new Schema<TxOrphaned>(
  {
    amount: { type: mongoose.Schema.Types.Mixed, required: true },
    blockNumber: { type: Number, required: true },
    chain: { type: String, required: true },
    currency: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    txHash: { type: String, required: true, unique: true, index: true },
  },
  {
    collection: 'txOrphaned',
    timestamps: true,
  }
);

const TxOrphanedModel = mongoose.model('TxOrphaned', TxOrphanedSchema);

export default TxOrphanedModel;
