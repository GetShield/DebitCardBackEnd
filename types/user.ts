import { Types } from 'mongoose';
import { IWallet } from './wallet';

// card1 is stringified JSON
export interface NewAirtableUser {
  userId: string;
  rampUserId: string;
  userName: string;
  userEmail: string;
  card1: string;
}

export interface NewUser {
  user_name: string;
  email: string;
  password: string;
  wallets: [];
}

export interface IUser {
  user_name: string;
  email: string;
  password: string;
  wallets: Types.ObjectId[] | IWallet[];
}

export type UserId = Types.ObjectId;
