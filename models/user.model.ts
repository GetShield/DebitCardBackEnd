import { Schema, model } from 'mongoose';

import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    user_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallets: [{ type: Schema.Types.ObjectId, ref: 'wallets' }],
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

export default model<IUser>('User', userSchema);
