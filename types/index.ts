import { ObjectId } from 'mongoose';

export * from './token';
export * from './user';
export * from './cards';
export * from './transactions';
export * from './txData';
export * from './limits';
export * from './balance';
export * from './wallet';

export type Balance = {
  currency: string;
  userId: ObjectId;
  amount: number;
};
