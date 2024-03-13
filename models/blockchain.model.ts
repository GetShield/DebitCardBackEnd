import mongoose, { Schema, Document } from 'mongoose';

interface IBlockchain extends Document {
  chain: String;
  chainId: Number;
  native_symbol: String;
  wallets: Array<Schema.Types.ObjectId>;
  mainnet: Boolean;
  chainType: String;
}

const Blockchain = new Schema(
  {
    chain: { type: String, required: true, unique: true },
    chainId: { type: Number, required: false },
    native_symbol: { type: String, required: true },
    chainType: { type: String, required: true },
    wallets: [{ type: Schema.Types.ObjectId, ref: 'wallets' }],
    mainnet: { type: Boolean, required: true },
  },
  {
    collection: 'blockchains',
  }
);

export default mongoose.model<IBlockchain>('blockchains', Blockchain);
