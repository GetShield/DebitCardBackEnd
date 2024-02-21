import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  user_name: String,
  email: String,
  password:  String,
  wallets: Array<Schema.Types.ObjectId>;
}

const User: Schema = new Schema(
  {
    user_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallets: [{ type: Schema.Types.ObjectId, ref: 'wallets' }],
  },
  {
    collection: 'users',
  }
);

export default mongoose.model<IUser>('users', User);
