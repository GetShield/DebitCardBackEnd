const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Wallet = new Schema(
  {
    address: { type: String },
    chain_type: { type: String },
    token_type: { type: String },
    balance: { type: String },
  },
  {
    collection: 'wallets',
  }
);

module.exports = mongoose.model('wallets', Wallet);
