import mongoose, { Schema, Document } from 'mongoose';

interface IBlockchain extends Document {
  name: String,
  chainId: Number,
  native_symbol: String
}

const Blockchain = new Schema(
  {
    name: { type: String, required: true, unique: true },
    chainId: { type: Number, required: false },
    native_symbol: { type: String, required: true },
  },
  {
    collection: 'blockchains',
  }
);

export default  mongoose.model<IBlockchain>('blockchains', Blockchain);
