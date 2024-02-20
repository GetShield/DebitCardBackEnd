import mongoose, { Schema, Document } from 'mongoose';

interface IBalance extends Document {
    date: Date;
    amount: Number;
    user: Schema.Types.ObjectId;
}

const BalanceSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        crypto: { type: String, required: true },
        wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true }
    },
    {
        collection: 'balances',
    }
);

export default mongoose.model<IBalance>('balances', BalanceSchema);