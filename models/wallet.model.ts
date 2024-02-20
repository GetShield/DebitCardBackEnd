import mongoose, { Schema, Document } from 'mongoose';

interface IWallet extends Document {
    date: Date;
    amount: Number;
    address: String;
    user: Schema.Types.ObjectId;
}

const WalletSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        address: { type: String, required: true, unique: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        collection: 'wallets',
    }
);

export default mongoose.model<IWallet>('wallets', WalletSchema);