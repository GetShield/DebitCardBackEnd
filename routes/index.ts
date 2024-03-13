import { Application } from 'express';

import userRoutes from './user.route';
import walletRoutes from './wallet.route';
import authRoutes from './auth.route';
import cardRoutes from './cards.route';
import transactionsRoutes from './transactions.route';
import blockchainRoutes from './blockchain.route';
import balanceRoutes from './balance.route';
import txHash from './txHash.route';
import webhookRoutes from './webhook.route';

const init = function (app: Application) {
  app.use('/api/users', userRoutes);
  app.use('/api/wallets', walletRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/cards', cardRoutes);
  app.use('/api/blockchains', blockchainRoutes);
  app.use('/api/transactions', transactionsRoutes);
  app.use('/api/balances', balanceRoutes);
  app.use('/api/tx-hash', txHash);
  app.use('/api/webhook', webhookRoutes);

  app.get('/health-check', (req, res) => res.status(200).send('OK'));
};

export default { init };
