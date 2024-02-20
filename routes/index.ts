import { Application } from 'express';

const userRoutes = require('./user.route');
const walletRoutes = require('./wallet.route');
const authRoutes = require('./auth.route');
const cardRoutes = require('./cards.route');
const transactionsRoutes = require('./transactions.route');


//const blockchainRoutes = require('./blockchain.route');
const transactionRoutes = require('./transaction.route');
//const balanceRoutes = require('./balance.route');


exports.init = function (app: Application) {
  app.use('/api/users', userRoutes);
  app.use('/api/wallets', walletRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/cards', cardRoutes);
  //app.use('/api/blockchains', blockchainRoutes);
  app.use('/api/transactions', transactionRoutes);
  //app.use('/api/balances', balanceRoutes);

};
