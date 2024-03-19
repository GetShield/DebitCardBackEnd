export interface AirtableCard {
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCVV: string;
}

export interface RampCardsResponse {
  page: Page;
  data: RampCard[];
}

export interface Page {
  next: any;
}

export interface RampCard {
  id: string;
  state: string;
  cardholder_name: string;
  fulfillment: Fulfillment;
  cardholder_id: string;
  spending_restrictions: SpendingRestrictions;
  expiration: string;
  card_program_id: any;
  display_name: string;
  is_physical: boolean;
  created_at: string;
  has_program_overridden: boolean;
  last_four: string;
  entity_id: string;
}

export interface Fulfillment {
  shipping_tracking_url: any;
  shipping: Shipping;
  shipping_date: any;
  shipping_eta: any;
  fulfillment_status: string;
}

export interface Shipping {
  recipient_address: RecipientAddress;
}

export interface RecipientAddress {
  state: string;
  last_name: string;
  postal_code: string;
  city: string;
  country: string;
  phone: string;
  address1: string;
  first_name: string;
}

export interface SpendingRestrictions {
  suspended: boolean;
  categories: any[];
  blocked_categories: any[];
  auto_lock_date: any;
  transaction_amount_limit: any;
  amount: number;
  interval: string;
}
