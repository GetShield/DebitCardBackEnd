import mongoose, { Schema, Document } from "mongoose";

interface IBlockchain extends Document {
  name: String;
  chainId: Number;
  chainType: String;
  native_symbol: String;
  wallets: Array<Schema.Types.ObjectId>;
  mainnet: Boolean;
}

const Blockchain = new Schema(
  {
    name: { type: String, required: true, unique: true },
    chainId: { type: Number, required: false },
    chainType: { type: String, required: true },
    native_symbol: { type: String, required: true },
    wallets: [{ type: Schema.Types.ObjectId, ref: "wallets" }],
    mainnet: { type: Boolean, required: true },
  },
  {
    collection: "blockchains",
  }
);

export default mongoose.model<IBlockchain>("blockchains", Blockchain);
