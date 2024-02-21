import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  user_name: String,
  email: String,
  password:  String
}

const User: Schema = new Schema(
  {
    user_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    collection: 'users',
  }
);

export default mongoose.model<IUser>('users', User);
