import mongoose, { Schema, Document } from 'mongoose';

interface IWallet extends Document {
    date: Date;
    address: String;
    user: Schema.Types.ObjectId;
    blockchains: Array<Schema.Types.ObjectId>;
}

const WalletSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        address: { type: String, required: true, unique: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        blockchains: [{ type: Schema.Types.ObjectId, ref: 'blockchains' }]
    },
    {
        collection: 'wallets',
    }
);

export default mongoose.model<IWallet>('wallets', WalletSchema);