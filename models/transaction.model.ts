import mongoose, { Schema, Document } from 'mongoose';

interface ITransaction extends Document {
    date: Date;
    amount: Number;
    from_address: String,
    to_address: String,
    Balance: Schema.Types.ObjectId
}

const TransactionSchema: Schema = new Schema(
    {
        date: { type: Date, required: true },
        from_address: { type: String, required: true },
        to_address: { type: String, required: true },
        tx_id: { type: String, required: true, unique: true },
        amount: { type: Number, required: true },
        Balance: { type: Schema.Types.ObjectId, ref: 'Balance', required: true }
    },
    {
        collection: 'Transactions',
    }
);

export default mongoose.model<ITransaction>('Transactions', TransactionSchema);