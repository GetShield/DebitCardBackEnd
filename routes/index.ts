import { Application } from 'express';

import userRoutes from './user.route';
import walletRoutes from './wallet.route';
import authRoutes from './auth.route';
import cardRoutes from './cards.route';
import transactionsRoutes from './transactions.route';


import blockchainRoutes from './blockchain.route';
import blockchainTransactionRoutes from './blockchain-transaction.route';
//import balanceRoutes from './balance.route';


const init = function (app: Application) {
  app.use('/api/users', userRoutes);
  app.use('/api/wallets', walletRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/cards', cardRoutes);
  app.use('/api/blockchains', blockchainRoutes);
  app.use('/api/transactions', transactionsRoutes);
  app.use('/api/blockchain-transactions', blockchainTransactionRoutes);
  //app.use('/api/balances', balanceRoutes);

};                                                              

export default {init};

