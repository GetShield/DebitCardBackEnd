import mongoose, { Schema, Document } from 'mongoose';

export interface Transaction extends Document {
  ramp_amount: Number;
  ramp_currency_code: String;
  ramp_transaction_id: String;
  ramp_user_transaction_time: String;
  user: Schema.Types.ObjectId;
}

const TransactionModel: Schema = new Schema(
  {
    ramp_amount: { type: Number, required: true },
    ramp_currency_code: { type: String, required: true },
    ramp_transaction_id: { type: String, required: true, index: true },
    ramp_user_transaction_time: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
  },
  {
    collection: 'transactions',
    timestamps: true,
  }
);

export default mongoose.model<Transaction>('transactions', TransactionModel);
