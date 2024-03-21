import { Types } from 'mongoose';

import { IBlockchain } from './blockchain';

export interface CryptoDeduction {
  ticker: string;
  amount: number;
  blockchain: Types.ObjectId | IBlockchain;
  exchangeRate: number;
  usdValue: number;
}

export interface Transaction {
  crypto_deductions: CryptoDeduction[];
  ramp_amount: number;
  ramp_currency_code: string;
  ramp_transaction_id: string;
  ramp_user_transaction_time: string;
  user: Types.ObjectId;
}

// Ramp types
export interface RampTransactionsResponse {
  page: Page;
  data: RampTransaction[];
}

interface Page {
  next: any;
}

export interface RampTransaction {
  original_transaction_amount: OriginalTransactionAmount;
  entity_id: string;
  state: string;
  merchant_id: string;
  line_items: LineItem[];
  card_id: string;
  currency_code: string;
  memo?: string;
  disputes: any[];
  card_holder: CardHolder;
  user_transaction_time: string;
  merchant_category_code: any;
  receipts: any[];
  sk_category_id: number;
  merchant_descriptor: string;
  merchant_category_code_description: any;
  accounting_field_selections: AccountingFieldSelection[];
  synced_at?: string;
  accounting_categories: AccountingCategory[];
  policy_violations: any[];
  id: string;
  settlement_date?: string;
  sk_category_name: string;
  merchant_name: string;
  amount: number;
}

interface OriginalTransactionAmount {
  currency_code: string;
  amount: number;
}

interface LineItem {
  accounting_field_selections: any[];
  amount: Amount;
}

interface Amount {
  currency_code: string;
  amount: number;
}

interface CardHolder {
  department_id: string;
  department_name: string;
  last_name: string;
  location_name: string;
  first_name: string;
  location_id: string;
  user_id: string;
}

interface AccountingFieldSelection {
  id: string;
  external_code: any;
  name: string;
  external_id: string;
  type: string;
  category_info: CategoryInfo;
}

interface CategoryInfo {
  external_id: string;
  type: string;
  name: string;
  id: string;
}

interface AccountingCategory {
  tracking_category_remote_name: string;
  tracking_category_remote_type: string;
  tracking_category_remote_id: string;
  category_id: any;
  category_name: string;
}
