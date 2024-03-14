export interface Limits {
  page: Page;
  data: Limit[];
}

interface Page {
  next: any;
}

export interface Limit {
  balance: Balance;
  cards: Card[];
  display_name: string;
  entity_id: string;
  has_program_overridden: boolean;
  id: string;
  permitted_spend_types: PermittedSpendTypes;
  restrictions: Restrictions;
  state: string;
  suspension: any;
  users: User[];
}

interface Restrictions {
  auto_lock_date: any;
  interval: string;
  limit: LimitRestriction;
  next_interval_reset: string;
  start_of_interval: string;
  transaction_amount_limit: any;
}

interface LimitRestriction {
  amount: number;
  currency_code: string;
}

interface Balance {
  total: Total;
  pending: Pending;
  cleared: Cleared;
}

interface Total {
  amount: number;
  currency_code: string;
}

interface Pending {
  amount: number;
  currency_code: string;
}

interface Cleared {
  amount: number;
  currency_code: string;
}

interface Card {
  card_id: string;
  is_ap_card: boolean;
  via_new_product_or_service: boolean;
}

interface User {
  user_id: string;
}

interface PermittedSpendTypes {
  primary_card_enabled: boolean;
  reimbursements_enabled: boolean;
}

type SpendingRestrictions = {
  limit: SpendingLimit;
  interval: 'TOTAL'; // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ANNUAL' | 'TOTAL'
};

type SpendingLimit = {
  amount: number;
  currency_code: string;
};

export type LimitUpdateBody = {
  spending_restrictions: SpendingRestrictions;
};
