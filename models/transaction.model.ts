import { Schema, model } from 'mongoose';

import { CryptoDeduction, Transaction } from '../types';

const CryptoDeductionSchema: Schema = new Schema<CryptoDeduction>({
  amount: { type: Number, required: true },
  blockchain: {
    type: Schema.Types.ObjectId,
    ref: 'blockchains',
    required: true,
  },
  exchangeRate: { type: Number, required: true },
  ticker: { type: String, required: true },
  usdValue: { type: Number, required: true },
});

const TransactionModel: Schema = new Schema<Transaction>(
  {
    crypto_deductions: [CryptoDeductionSchema],
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

export default model<Transaction>('transactions', TransactionModel);
