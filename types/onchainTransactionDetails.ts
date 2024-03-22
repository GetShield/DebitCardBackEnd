export interface OnchainReceipt {
  apiVersion: string;
  requestId: string;
  data: Item;
}

interface Item {
  item: Data;
}

interface Data {
  index: number;
  isConfirmed: Boolean;
  minedInBlockHash: string;
  minedInBlockHeight: number;
  recipients: Array<string>;
  senders: Array<{ sender: string; amount: string }>;
  timestamp: number;
  transactionHash: string;
  transactionId: string;
  blockchainSpecific: Array<any>;
  fee: Array<any>;
}