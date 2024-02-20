import { Card } from './cards';

export interface User {
  user_name: string;
  email: string;
  password: string;
  btc_wallet: string;
  ether_wallet: string;
  tron_wallet: string;
}

// card1 is stringified JSON
export interface NewAirtableUser {
  userId: string;
  rampUserId: string;
  userName: string;
  userEmail: string;
  card1: string;
}
