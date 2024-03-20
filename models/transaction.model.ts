import mongoose, { Schema, Document } from 'mongoose';

export interface Transaction extends Document {
  crypto_deductions: Array<{
    blockchain: Schema.Types.ObjectId;
    amount: String;
    exchangeRate: Number;
    usdValue: Number;
  }>;
  ramp_amount: Number;
  ramp_currency_code: String;
  ramp_transaction_id: String;
  ramp_user_transaction_time: String;
  user: Schema.Types.ObjectId;
}

const TransactionModel: Schema = new Schema(
  {
    crypto_deductions: [
      {
        blockchain: { type: Schema.Types.ObjectId, ref: 'blockchains' },
        amount: { type: String, required: true },
        exchangeRate: { type: Number, required: true },
        usdValue: { type: Number, required: true },
      },
    ],
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
